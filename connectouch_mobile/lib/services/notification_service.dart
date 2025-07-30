import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:permission_handler/permission_handler.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();
  static FirebaseMessaging? _firebaseMessaging;
  static bool _isInitialized = false;

  // Initialize notification service
  static Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // Request permissions
      await _requestPermissions();

      // Initialize local notifications
      await _initializeLocalNotifications();

      // Initialize Firebase messaging (optional)
      await _initializeFirebaseMessaging();

      _isInitialized = true;
      debugPrint('✅ Notification Service initialized');
    } catch (e) {
      debugPrint('❌ Failed to initialize Notification Service: $e');
    }
  }

  // Request notification permissions
  static Future<void> _requestPermissions() async {
    try {
      if (Platform.isIOS) {
        final status = await Permission.notification.request();
        if (status != PermissionStatus.granted) {
          debugPrint('❌ Notification permission denied');
        }
      } else if (Platform.isAndroid) {
        final status = await Permission.notification.request();
        if (status != PermissionStatus.granted) {
          debugPrint('❌ Notification permission denied');
        }
      }
    } catch (e) {
      debugPrint('❌ Failed to request notification permissions: $e');
    }
  }

  // Initialize local notifications
  static Future<void> _initializeLocalNotifications() async {
    try {
      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
      const iosSettings = DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );

      const initializationSettings = InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      );

      await _localNotifications.initialize(
        initializationSettings,
        onDidReceiveNotificationResponse: _onNotificationTapped,
      );

      // Create notification channels for Android
      if (Platform.isAndroid) {
        await _createNotificationChannels();
      }

      debugPrint('✅ Local notifications initialized');
    } catch (e) {
      debugPrint('❌ Failed to initialize local notifications: $e');
    }
  }

  // Initialize Firebase messaging
  static Future<void> _initializeFirebaseMessaging() async {
    try {
      _firebaseMessaging = FirebaseMessaging.instance;

      // Request permission for iOS
      if (Platform.isIOS) {
        await _firebaseMessaging!.requestPermission(
          alert: true,
          badge: true,
          sound: true,
        );
      }

      // Get FCM token
      final token = await _firebaseMessaging!.getToken();
      debugPrint('FCM Token: $token');

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Handle background messages
      FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);

      // Handle notification taps when app is terminated
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

      debugPrint('✅ Firebase messaging initialized');
    } catch (e) {
      debugPrint('❌ Failed to initialize Firebase messaging: $e');
    }
  }

  // Create notification channels for Android
  static Future<void> _createNotificationChannels() async {
    try {
      const channels = [
        AndroidNotificationChannel(
          'price_alerts',
          'Price Alerts',
          description: 'Notifications for price changes and alerts',
          importance: Importance.high,
          playSound: true,
        ),
        AndroidNotificationChannel(
          'portfolio_updates',
          'Portfolio Updates',
          description: 'Notifications for portfolio changes',
          importance: Importance.defaultImportance,
        ),
        AndroidNotificationChannel(
          'news_updates',
          'News Updates',
          description: 'Notifications for market news and updates',
          importance: Importance.defaultImportance,
        ),
        AndroidNotificationChannel(
          'transaction_alerts',
          'Transaction Alerts',
          description: 'Notifications for transaction confirmations',
          importance: Importance.high,
          playSound: true,
        ),
      ];

      for (final channel in channels) {
        await _localNotifications
            .resolvePlatformSpecificImplementation<
                AndroidFlutterLocalNotificationsPlugin>()
            ?.createNotificationChannel(channel);
      }

      debugPrint('✅ Notification channels created');
    } catch (e) {
      debugPrint('❌ Failed to create notification channels: $e');
    }
  }

  // Show local notification
  static Future<void> showNotification(
    String title,
    String body, {
    String? channelId,
    Map<String, dynamic>? payload,
  }) async {
    try {
      if (!_isInitialized) await initialize();

      const androidDetails = AndroidNotificationDetails(
        'default',
        'Default',
        importance: Importance.high,
        priority: Priority.high,
        showWhen: true,
      );

      const iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const notificationDetails = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );

      await _localNotifications.show(
        DateTime.now().millisecondsSinceEpoch ~/ 1000,
        title,
        body,
        notificationDetails,
        payload: payload != null ? jsonEncode(payload) : null,
      );

      debugPrint('✅ Notification shown: $title');
    } catch (e) {
      debugPrint('❌ Failed to show notification: $e');
    }
  }

  // Show price alert notification
  static Future<void> showPriceAlert(
    String symbol,
    double price,
    double changePercent,
  ) async {
    try {
      final title = 'Price Alert: $symbol';
      final body = changePercent >= 0
          ? '$symbol reached \$${price.toStringAsFixed(2)} (+${changePercent.toStringAsFixed(1)}%)'
          : '$symbol dropped to \$${price.toStringAsFixed(2)} (${changePercent.toStringAsFixed(1)}%)';

      const androidDetails = AndroidNotificationDetails(
        'price_alerts',
        'Price Alerts',
        importance: Importance.high,
        priority: Priority.high,
        showWhen: true,
        color: Color(0xFF00D4AA),
      );

      const iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const notificationDetails = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );

      await _localNotifications.show(
        DateTime.now().millisecondsSinceEpoch ~/ 1000,
        title,
        body,
        notificationDetails,
        payload: jsonEncode({
          'type': 'price_alert',
          'symbol': symbol,
          'price': price,
          'changePercent': changePercent,
        }),
      );

      debugPrint('✅ Price alert shown: $symbol');
    } catch (e) {
      debugPrint('❌ Failed to show price alert: $e');
    }
  }

  // Show portfolio update notification
  static Future<void> showPortfolioUpdate(
    double totalValue,
    double changePercent,
  ) async {
    try {
      const title = 'Portfolio Update';
      final body = changePercent >= 0
          ? 'Your portfolio is now worth \$${totalValue.toStringAsFixed(2)} (+${changePercent.toStringAsFixed(1)}%)'
          : 'Your portfolio is now worth \$${totalValue.toStringAsFixed(2)} (${changePercent.toStringAsFixed(1)}%)';

      const androidDetails = AndroidNotificationDetails(
        'portfolio_updates',
        'Portfolio Updates',
        importance: Importance.defaultImportance,
        showWhen: true,
      );

      const iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: false,
      );

      const notificationDetails = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );

      await _localNotifications.show(
        DateTime.now().millisecondsSinceEpoch ~/ 1000,
        title,
        body,
        notificationDetails,
        payload: jsonEncode({
          'type': 'portfolio_update',
          'totalValue': totalValue,
          'changePercent': changePercent,
        }),
      );

      debugPrint('✅ Portfolio update shown');
    } catch (e) {
      debugPrint('❌ Failed to show portfolio update: $e');
    }
  }

  // Show transaction confirmation
  static Future<void> showTransactionConfirmation(
    String txHash,
    String type,
    String amount,
  ) async {
    try {
      const title = 'Transaction Confirmed';
      final body = '$type of $amount confirmed\nTx: ${txHash.substring(0, 10)}...';

      const androidDetails = AndroidNotificationDetails(
        'transaction_alerts',
        'Transaction Alerts',
        importance: Importance.high,
        priority: Priority.high,
        showWhen: true,
        color: Color(0xFF00D4AA),
      );

      const iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const notificationDetails = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );

      await _localNotifications.show(
        DateTime.now().millisecondsSinceEpoch ~/ 1000,
        title,
        body,
        notificationDetails,
        payload: jsonEncode({
          'type': 'transaction_confirmation',
          'txHash': txHash,
          'transactionType': type,
          'amount': amount,
        }),
      );

      debugPrint('✅ Transaction confirmation shown');
    } catch (e) {
      debugPrint('❌ Failed to show transaction confirmation: $e');
    }
  }

  // Handle notification tap
  static void _onNotificationTapped(NotificationResponse response) {
    try {
      if (response.payload != null) {
        final payload = jsonDecode(response.payload!);
        final type = payload['type'] as String;

        switch (type) {
          case 'price_alert':
            // Navigate to specific coin page
            debugPrint('Navigate to coin: ${payload['symbol']}');
            break;
          case 'portfolio_update':
            // Navigate to portfolio page
            debugPrint('Navigate to portfolio');
            break;
          case 'transaction_confirmation':
            // Navigate to transaction details
            debugPrint('Navigate to transaction: ${payload['txHash']}');
            break;
        }
      }
    } catch (e) {
      debugPrint('❌ Failed to handle notification tap: $e');
    }
  }

  // Handle foreground Firebase messages
  static Future<void> _handleForegroundMessage(RemoteMessage message) async {
    try {
      debugPrint('Foreground message: ${message.notification?.title}');
      
      if (message.notification != null) {
        await showNotification(
          message.notification!.title ?? 'Notification',
          message.notification!.body ?? '',
          payload: message.data,
        );
      }
    } catch (e) {
      debugPrint('❌ Failed to handle foreground message: $e');
    }
  }

  // Handle background Firebase messages
  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    try {
      debugPrint('Background message: ${message.notification?.title}');
    } catch (e) {
      debugPrint('❌ Failed to handle background message: $e');
    }
  }

  // Handle notification tap from Firebase
  static void _handleNotificationTap(RemoteMessage message) {
    try {
      debugPrint('Notification tapped: ${message.data}');
    } catch (e) {
      debugPrint('❌ Failed to handle notification tap: $e');
    }
  }

  // Cancel all notifications
  static Future<void> cancelAllNotifications() async {
    try {
      await _localNotifications.cancelAll();
      debugPrint('✅ All notifications cancelled');
    } catch (e) {
      debugPrint('❌ Failed to cancel notifications: $e');
    }
  }

  // Get FCM token
  static Future<String?> getFCMToken() async {
    try {
      if (_firebaseMessaging != null) {
        return await _firebaseMessaging!.getToken();
      }
      return null;
    } catch (e) {
      debugPrint('❌ Failed to get FCM token: $e');
      return null;
    }
  }
}
