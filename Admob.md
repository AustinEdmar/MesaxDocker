https://medium.com/@diegoturchi95/admob-integration-in-compose-multiplatform-kmp-65de75b2f67c
#### ANDROID

1-manisfest

        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713"/>
    </application>


2 - mainactivity
package com.sme.admob

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.gms.ads.*
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback

class MainActivity : ComponentActivity() {

    private var interstitialAd: InterstitialAd? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // ✅ Inicialização correta (Main Thread)
        MobileAds.initialize(this)

        setContent {
            App(
                createBannerAd = {
                    BannerAd()
                },
                loadFullScreenAd = {
                    loadInterstitial()
                },
                showFullScreenAd = {
                    interstitialAd?.show(this)
                }
            )
        }
    }

    // ✅ Banner separado (boa prática)
    @Composable
    fun BannerAd() {
        AndroidView(
            modifier = Modifier.fillMaxWidth(),
            factory = { context ->
                AdView(context).apply {
                    setAdSize(AdSize.BANNER)

                    // ✅ ID de teste oficial
                    adUnitId = "ca-app-pub-3940256099942544/6300978111"

                    loadAd(AdRequest.Builder().build())
                }
            }
        )
    }

    // ✅ Carregar interstitial corretamente
    private fun loadInterstitial() {
        InterstitialAd.load(
            this,
            // ✅ ID de teste oficial
            "ca-app-pub-3940256099942544/1033173712",
            AdRequest.Builder().build(),
            object : InterstitialAdLoadCallback() {

                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    interstitialAd = null
                }
            }
        )
    }
}



3 - commommain App.kt
package com.sme.admob

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.jetbrains.compose.resources.painterResource

import admob.composeapp.generated.resources.Res
import admob.composeapp.generated.resources.compose_multiplatform

@Composable
fun App(
    createBannerAd: @Composable () -> Unit = {},
    loadFullScreenAd: () -> Unit = {},
    showFullScreenAd: () -> Unit = {}
) {
    MaterialTheme {
        var showContent by remember { mutableStateOf(false) }
        Column(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.primaryContainer)
                .safeContentPadding()
                .fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            // Exibe o Banner no topo ou onde desejar
            createBannerAd()

            Spacer(modifier = Modifier.height(16.dp))

            Button(onClick = { loadFullScreenAd() }) {
                Text("Carregar Interstitial")
            }

            Button(onClick = { showFullScreenAd() }) {
                Text("Mostrar Interstitial")
            }

            Button(onClick = { showContent = !showContent }) {
                Text("Click me!")
            }

            AnimatedVisibility(showContent) {
                val greeting = remember { Greeting().greet() }
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Image(painterResource(Res.drawable.compose_multiplatform), null)
                    Text("Compose: $greeting")
                }
            }
        }
    }
}


#### IOS

0 -
pod init
If you can see Podfile in iosApp folder, the initialization completed successfully.

Let’s add google ads dependency to Podfile:
platform :ios, '12.0'

target 'iosApp' do
    use_frameworks!
    pod 'Google-Mobile-Ads-SDK'

end
Install pods in terminal
pod install --repo-update


1 - info.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CADisableMinimumFrameDurationOnPhone</key>
	<true/>
    <key>GADApplicationIdentifier</key>
    <string>ca-app-pub-3940256099942544~3347511713</string>
</dict>
</plist>

2 - ContenView

import UIKit



import SwiftUI
import ComposeApp
import GoogleMobileAds

struct ComposeView: UIViewControllerRepresentable {
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIViewController(context: Context) -> UIViewController {
        MainViewControllerKt.MainViewController(
            createBannerAd: { () -> UIViewController in
                let adBannerView = VStack {
                    BannerAdView(adUnitID: "ca-app-pub-3940256099942544/2435281174")
                }
                return UIHostingController(rootView: adBannerView)
            },
            loadFullScreenAd: {
                Task { [weak coordinator = context.coordinator] in
                    await coordinator?.loadInterstitialAd()
                }
            },
            showFullScreenAd: {
                context.coordinator.showInterstitialAd()
            }
        )
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}

struct ContentView: View {
    var body: some View {
        ComposeView()
                .ignoresSafeArea(.keyboard) // Compose has own keyboard handler
    }
}



3 - IOSApp
import SwiftUI
import GoogleMobileAds

@main
struct iOSApp: App {
    
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        GADMobileAds.sharedInstance().start(completionHandler: nil)
        return true
    }
}

4 - BAnnerView
//
//  BannerAdView.swift
//  iosApp
//
//  Created by Steve Pha on 16/09/2024.
//  Copyright © 2024 orgName. All rights reserved.
//

import Foundation
import SwiftUI
import GoogleMobileAds
import UIKit

struct BannerAdView: UIViewRepresentable {
    let adUnitID: String
    
    func makeUIView(context: Context) -> GADBannerView {
        let bannerView = GADBannerView()
        
        bannerView.adUnitID = adUnitID
        let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene
        if let rootViewController = windowScene?.windows.first?.rootViewController {
            bannerView.rootViewController = rootViewController
        }
    
        bannerView.load(GADRequest())
        return bannerView
    }
    
    func updateUIView(_ uiView: GADBannerView, context: Context) {
        
    }
}

class Coordinator: NSObject {
    var interstitialAd: GADInterstitialAd?

    func loadInterstitialAd() async {
        do {
            self.interstitialAd = try await GADInterstitialAd.load(
                withAdUnitID: "ca-app-pub-3940256099942544/4411468910",
                request: GADRequest()
            )
        } catch {
            print("Failed to load interstitial ad: \(error)")
        }
    }

    func showInterstitialAd() {
        if let interstitialAd = interstitialAd {
            // Get the root view controller
            if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
                interstitialAd.present(fromRootViewController: rootViewController)
            } else {
                print("Root view controller not available")
            }
        } else {
            print("Interstitial ad is not ready")
        }
    }
}


