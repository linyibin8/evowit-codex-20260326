# Mac release path

## Goal

Build the iOS app on the remote Mac, sign it with automatic signing, then upload to TestFlight.

## Environment variables needed on the Mac

```bash
export FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD="mphp-yceo-cgqm-fbfc"
export FASTLANE_USER="3972104921@qq.com"
export DELIVER_ITMSTRANSPORTER_ADDITIONAL_UPLOAD_PARAMETERS="-t DAV"
export APPLE_DEVELOPER_TEAM_ID="YOUR_TEAM_ID"
export APP_STORE_CONNECT_TEAM_ID="YOUR_ASC_TEAM_ID"
```

## Commands

```bash
cd ~/evowit-codex-20260326/ios
brew install xcodegen fastlane || true
xcodegen generate
fastlane beta
```

## What still has to be discovered on the Mac

- Team ID
- whether Xcode already has the Apple account signed in
- whether the connected iPhone 11 is trusted and visible to Xcode
- whether automatic signing can create the provisioning profile
