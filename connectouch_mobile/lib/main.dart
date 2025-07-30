import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'screens/splash_screen.dart';
import 'services/notification_service.dart';
import 'services/storage_service.dart';
import 'services/wallet_service.dart';
import 'utils/theme.dart';
import 'utils/constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  
  // Initialize services
  await StorageService.initialize();
  await NotificationService.initialize();
  await WalletService.initialize();
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.black,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  runApp(const ProviderScope(child: ConnectouchApp()));
}

class ConnectouchApp extends ConsumerWidget {
  const ConnectouchApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: 'Connectouch Blockchain Platform',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const SplashScreen(),
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: const TextScaler.linear(1.0), // Prevent text scaling
          ),
          child: child!,
        );
      },
    );
  }
}

class ConnectouchAppState extends StateNotifier<AppState> {
  ConnectouchAppState() : super(AppState.initial());
  
  void updateConnectionStatus(bool isConnected) {
    state = state.copyWith(isConnected: isConnected);
  }
  
  void updateWalletStatus(bool isWalletConnected) {
    state = state.copyWith(isWalletConnected: isWalletConnected);
  }
  
  void updateTheme(ThemeMode themeMode) {
    state = state.copyWith(themeMode: themeMode);
  }
}

class AppState {
  final bool isConnected;
  final bool isWalletConnected;
  final ThemeMode themeMode;
  final String? walletAddress;
  
  const AppState({
    required this.isConnected,
    required this.isWalletConnected,
    required this.themeMode,
    this.walletAddress,
  });
  
  factory AppState.initial() {
    return const AppState(
      isConnected: true,
      isWalletConnected: false,
      themeMode: ThemeMode.dark,
    );
  }
  
  AppState copyWith({
    bool? isConnected,
    bool? isWalletConnected,
    ThemeMode? themeMode,
    String? walletAddress,
  }) {
    return AppState(
      isConnected: isConnected ?? this.isConnected,
      isWalletConnected: isWalletConnected ?? this.isWalletConnected,
      themeMode: themeMode ?? this.themeMode,
      walletAddress: walletAddress ?? this.walletAddress,
    );
  }
}

// Providers
final appStateProvider = StateNotifierProvider<ConnectouchAppState, AppState>(
  (ref) => ConnectouchAppState(),
);

final connectivityProvider = StreamProvider<bool>((ref) {
  return StorageService.connectivityStream;
});

final walletProvider = StateNotifierProvider<WalletNotifier, WalletState>(
  (ref) => WalletNotifier(),
);

class WalletNotifier extends StateNotifier<WalletState> {
  WalletNotifier() : super(WalletState.initial());
  
  Future<void> connectWallet() async {
    state = state.copyWith(isConnecting: true);
    
    try {
      final address = await WalletService.connectWallet();
      state = state.copyWith(
        isConnected: true,
        isConnecting: false,
        address: address,
      );
    } catch (e) {
      state = state.copyWith(
        isConnecting: false,
        error: e.toString(),
      );
    }
  }
  
  Future<void> disconnectWallet() async {
    await WalletService.disconnectWallet();
    state = WalletState.initial();
  }
}

class WalletState {
  final bool isConnected;
  final bool isConnecting;
  final String? address;
  final String? error;
  
  const WalletState({
    required this.isConnected,
    required this.isConnecting,
    this.address,
    this.error,
  });
  
  factory WalletState.initial() {
    return const WalletState(
      isConnected: false,
      isConnecting: false,
    );
  }
  
  WalletState copyWith({
    bool? isConnected,
    bool? isConnecting,
    String? address,
    String? error,
  }) {
    return WalletState(
      isConnected: isConnected ?? this.isConnected,
      isConnecting: isConnecting ?? this.isConnecting,
      address: address ?? this.address,
      error: error ?? this.error,
    );
  }
}
