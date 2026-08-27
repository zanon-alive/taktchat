# Teste manual — app Android (Capacitor)

O APK **não** vai no Git. Depois do merge na `main`, o workflow `build-taktchat-android-apk` publica o arquivo no release `android-sideload`. O login aponta para `/downloads/taktchat.apk`, que o Nginx redireciona para esse release.

```bash
# Conferir o redirect (depois do deploy do frontend e do primeiro APK publicado)
BASE_URL="${BASE_URL:-https://taktchat.com.br}"
curl -sI "${BASE_URL}/downloads/taktchat.apk" | head -n 15
# Esperado: 302 para .../releases/download/android-sideload/taktchat.apk
```

## Instalar no Android (sem Play Store)

1. No celular, abra `https://taktchat.com.br/login`.
2. Toque em **Baixar app Android**.
3. Permita instalar de fontes desconhecidas (Chrome/arquivos), se o sistema pedir.
4. Abra o APK e instale.
5. Login → `/tickets` (mesmo chrome compacto da PWA).

Dentro do app Capacitor o link de download **não** aparece.

## iOS

Não há IPA nesta fatia. No iPhone: Safari → Compartilhar → Adicionar à Tela de Início.

## Fora desta entrega

Push com o app fechado, App Store, Play Store e service worker.
