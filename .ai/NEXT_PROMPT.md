# Taktchat — continuidade de sessão

**Branch git:** `feat/app-mobile-lojas`

## Estado
- Fatia 1 commitada nesta branch: Capacitor Android, link **Baixar app Android** no login, CI do APK (`android-sideload`).
- iOS/IPA e push: fora. PWA no iPhone continua válida.
- Após merge: esperar workflows frontend GHCR + `build-taktchat-android-apk` e o Portainer; aí o link `/downloads/taktchat.apk` funciona.

## Não fazer
- Capacitor iOS, Play/App Store, FCM/OneSignal.
- Reativar service worker. Deploy pelo agente.
