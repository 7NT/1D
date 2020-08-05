icongenie generate --padding 10,5 --skip-trim -i public/jb1D.png
quasar build -m capacitor -T android
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore jb1D.keystore dist/capacitor/android/apk/release/app-release-unsigned.apk alias_name
zipalign -v 4 dist/capacitor/android/apk/release/app-release-unsigned.apk jb1d_b6.apk
