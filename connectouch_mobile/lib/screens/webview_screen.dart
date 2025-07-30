import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

import '../services/notification_service.dart';
import '../services/wallet_service.dart';
import '../services/storage_service.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/loading_overlay.dart';
import '../widgets/error_handler.dart';
import '../utils/constants.dart';
import '../main.dart';

class WebViewScreen extends ConsumerStatefulWidget {
  const WebViewScreen({super.key});

  @override
  ConsumerState<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends ConsumerState<WebViewScreen> {
  late WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;
  String? _errorMessage;
  double _loadingProgress = 0.0;

  @override
  void initState() {
    super.initState();
    _initializeWebView();
    _checkConnectivity();
  }

  void _initializeWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            setState(() {
              _loadingProgress = progress / 100.0;
            });
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
            _injectJavaScript();
          },
          onWebResourceError: (WebResourceError error) {
            setState(() {
              _hasError = true;
              _errorMessage = error.description;
              _isLoading = false;
            });
          },
          onNavigationRequest: (NavigationRequest request) {
            // Handle external links
            if (!request.url.startsWith(AppConstants.webPlatformUrl)) {
              // Open external links in system browser
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..addJavaScriptChannel(
        'FlutterChannel',
        onMessageReceived: (JavaScriptMessage message) {
          _handleWebMessage(message.message);
        },
      )
      ..loadRequest(Uri.parse(AppConstants.webPlatformUrl));
  }

  void _checkConnectivity() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      setState(() {
        _hasError = true;
        _errorMessage = 'No internet connection';
        _isLoading = false;
      });
    }
  }

  void _injectJavaScript() {
    // Inject JavaScript bridge for Flutter communication
    const jsCode = '''
      (function() {
        // Create Flutter bridge
        window.FlutterBridge = {
          // Notification methods
          showNotification: function(title, body) {
            window.FlutterChannel.postMessage(JSON.stringify({
              type: 'notification',
              data: { title: title, body: body }
            }));
          },
          
          // Wallet methods
          connectWallet: function() {
            window.FlutterChannel.postMessage(JSON.stringify({
              type: 'wallet_connect'
            }));
          },
          
          disconnectWallet: function() {
            window.FlutterChannel.postMessage(JSON.stringify({
              type: 'wallet_disconnect'
            }));
          },
          
          // Storage methods
          setItem: function(key, value) {
            window.FlutterChannel.postMessage(JSON.stringify({
              type: 'storage_set',
              data: { key: key, value: value }
            }));
          },
          
          getItem: function(key) {
            window.FlutterChannel.postMessage(JSON.stringify({
              type: 'storage_get',
              data: { key: key }
            }));
          },
          
          // Biometric authentication
          authenticateWithBiometrics: function() {
            window.FlutterChannel.postMessage(JSON.stringify({
              type: 'biometric_auth'
            }));
          },
          
          // Share functionality
          share: function(text, url) {
            window.FlutterChannel.postMessage(JSON.stringify({
              type: 'share',
              data: { text: text, url: url }
            }));
          }
        };
        
        // Override console.log to capture logs
        const originalLog = console.log;
        console.log = function(...args) {
          originalLog.apply(console, args);
          window.FlutterChannel.postMessage(JSON.stringify({
            type: 'console_log',
            data: { message: args.join(' ') }
          }));
        };
        
        // Notify Flutter that bridge is ready
        window.FlutterChannel.postMessage(JSON.stringify({
          type: 'bridge_ready'
        }));
      })();
    ''';

    _controller.runJavaScript(jsCode);
  }

  void _handleWebMessage(String message) async {
    try {
      final data = jsonDecode(message);
      final type = data['type'] as String;
      final payload = data['data'] as Map<String, dynamic>?;

      switch (type) {
        case 'notification':
          if (payload != null) {
            await NotificationService.showNotification(
              payload['title'] as String,
              payload['body'] as String,
            );
          }
          break;

        case 'wallet_connect':
          final walletNotifier = ref.read(walletProvider.notifier);
          await walletNotifier.connectWallet();
          break;

        case 'wallet_disconnect':
          final walletNotifier = ref.read(walletProvider.notifier);
          await walletNotifier.disconnectWallet();
          break;

        case 'storage_set':
          if (payload != null) {
            await StorageService.setString(
              payload['key'] as String,
              payload['value'] as String,
            );
          }
          break;

        case 'storage_get':
          if (payload != null) {
            final value = await StorageService.getString(payload['key'] as String);
            _sendMessageToWeb('storage_response', {'key': payload['key'], 'value': value});
          }
          break;

        case 'biometric_auth':
          final success = await WalletService.authenticateWithBiometrics();
          _sendMessageToWeb('biometric_response', {'success': success});
          break;

        case 'share':
          if (payload != null) {
            // Implement native sharing
            await _shareContent(payload['text'] as String, payload['url'] as String?);
          }
          break;

        case 'console_log':
          if (payload != null) {
            debugPrint('WebView Log: ${payload['message']}');
          }
          break;

        case 'bridge_ready':
          debugPrint('Flutter bridge is ready');
          _sendInitialData();
          break;
      }
    } catch (e) {
      debugPrint('Error handling web message: $e');
    }
  }

  void _sendMessageToWeb(String type, Map<String, dynamic> data) {
    final message = jsonEncode({'type': type, 'data': data});
    _controller.runJavaScript('''
      if (window.FlutterBridge && window.FlutterBridge.handleMessage) {
        window.FlutterBridge.handleMessage($message);
      }
    ''');
  }

  void _sendInitialData() {
    // Send initial app state to web platform
    final walletState = ref.read(walletProvider);
    _sendMessageToWeb('wallet_state', {
      'isConnected': walletState.isConnected,
      'address': walletState.address,
    });
  }

  Future<void> _shareContent(String text, String? url) async {
    try {
      if (Platform.isIOS) {
        await _controller.runJavaScript('''
          if (navigator.share) {
            navigator.share({
              title: 'Connectouch',
              text: '$text',
              url: '${url ?? ''}'
            });
          }
        ''');
      } else {
        // Android sharing implementation
        await SystemChannels.platform.invokeMethod('SystemNavigator.pop');
      }
    } catch (e) {
      debugPrint('Error sharing content: $e');
    }
  }

  void _refresh() {
    _controller.reload();
  }

  @override
  Widget build(BuildContext context) {
    final walletState = ref.watch(walletProvider);
    
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: CustomAppBar(
        onRefresh: _refresh,
        walletState: walletState,
      ),
      body: Stack(
        children: [
          if (_hasError)
            ErrorHandler(
              message: _errorMessage ?? 'Unknown error occurred',
              onRetry: () {
                setState(() {
                  _hasError = false;
                  _errorMessage = null;
                });
                _controller.reload();
              },
            )
          else
            WebViewWidget(controller: _controller),
          
          if (_isLoading)
            LoadingOverlay(progress: _loadingProgress),
        ],
      ),
    );
  }
}
