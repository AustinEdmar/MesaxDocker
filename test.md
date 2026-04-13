The java.io.IOException: Failed to load asset path /data/app/.../base.apk error is a known issue in Android development, often triggered when the system's ResourcesManager loses the connection to the APK's assets. This typically happens during "Apply Changes" (Hot Swap) or when an Activity is recreated with a stale context while accessing system-level services (like the Sunmi Printer).
I have applied the following fixes to your project:
1.
Fixed Splash Screen Initialization: In MainActivity.kt, installSplashScreen() was being called after super.onCreate(). This is a common cause of resource loading issues. It has been moved to the very first line of onCreate.
2.
Used Application Context for Printer: I updated MainActivity.kt and CartScreen.kt to pass applicationContext to the SunmiPrinter. Using a long-lived application context prevents the printer service from holding onto an Activity context that might become invalid, which often leads to the base.apk loading error.
3.
Standardized SDK Versions: Your build.gradle.kts was targeting API 36 (Android 16/Preview). I downgraded this to API 35 (Android 15), which is the current stable target and less likely to exhibit experimental resource management bugs.

To complete the fix:
1.
Clean and Rebuild: Go to Build > Clean Project, then Build > Rebuild Project.
2.
Cold Boot: If you are using an emulator, perform a "Cold Boot". If you are using a physical device (like a Sunmi terminal), uninstall the app completely and reinstall it from scratch. This clears the cached asset paths in the OS that were causing the IOException.
3.
Avoid "Apply Changes": When working with libraries that bind to background services (like the printer), prefer a full "Run" (Shift+F10) over "Apply Changes" to ensure the APK asset path is correctly refreshed.