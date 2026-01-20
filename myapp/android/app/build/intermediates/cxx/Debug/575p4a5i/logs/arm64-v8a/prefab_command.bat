@echo off
"C:\\Program Files\\Microsoft\\jdk-17.0.16.8-hotspot\\bin\\java" ^
  --class-path ^
  "C:\\Users\\win 10\\.gradle\\caches\\modules-2\\files-2.1\\com.google.prefab\\cli\\2.1.0\\aa32fec809c44fa531f01dcfb739b5b3304d3050\\cli-2.1.0-all.jar" ^
  com.google.prefab.cli.AppKt ^
  --build-system ^
  cmake ^
  --platform ^
  android ^
  --abi ^
  arm64-v8a ^
  --os-version ^
  24 ^
  --stl ^
  c++_shared ^
  --ndk-version ^
  26 ^
  --output ^
  "C:\\Users\\WIN10~1\\AppData\\Local\\Temp\\agp-prefab-staging3353680102252927386\\staged-cli-output" ^
  "C:\\Users\\win 10\\.gradle\\caches\\8.14.3\\transforms\\e8fc849a76b121455249d79e48e7a487\\transformed\\react-android-0.81.4-debug\\prefab" ^
  "C:\\Users\\win 10\\.gradle\\caches\\8.14.3\\transforms\\22b5a8edebf81f357da4e862bdc5901f\\transformed\\hermes-android-0.81.4-debug\\prefab" ^
  "C:\\Users\\win 10\\.gradle\\caches\\8.14.3\\transforms\\ef79d8ef43d25f454f906afc65301bc3\\transformed\\fbjni-0.7.0\\prefab"
