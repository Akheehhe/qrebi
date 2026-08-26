import { LINKS } from '../config'

/* iOS can't join a network from a web page, but it can install a Wi-Fi
   configuration profile: Safari downloads this file, the guest taps
   Install once, and the phone joins (and rejoins) the network on its own.
   Android never hits this route — the page sends it to Wi-Fi settings
   with the password already on the clipboard. */

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function GET() {
  if (!LINKS.wifi) return new Response('Not found', { status: 404 })

  const ssid = escapeXml(LINKS.wifi.ssid)
  const password = escapeXml(LINKS.wifi.password)

  // fixed UUIDs on purpose: reinstalling replaces the profile instead of stacking
  const profile = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>AutoJoin</key>
      <true/>
      <key>EncryptionType</key>
      <string>WPA</string>
      <key>HIDDEN_NETWORK</key>
      <false/>
      <key>SSID_STR</key>
      <string>${ssid}</string>
      <key>Password</key>
      <string>${password}</string>
      <key>PayloadDescription</key>
      <string>Wi-Fi (${ssid})</string>
      <key>PayloadDisplayName</key>
      <string>Chito Gvrito Wi-Fi</string>
      <key>PayloadIdentifier</key>
      <string>ge.qrebi.chito-gvrito.wifi</string>
      <key>PayloadType</key>
      <string>com.apple.wifi.managed</string>
      <key>PayloadUUID</key>
      <string>7B1A4E62-9C3D-4F5A-8E21-C0FFEE000001</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>ჩიტო გვრიტოს Wi-Fi · Chito Gvrito Wi-Fi</string>
  <key>PayloadDisplayName</key>
  <string>Chito Gvrito Wi-Fi</string>
  <key>PayloadIdentifier</key>
  <string>ge.qrebi.chito-gvrito</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>3F8D2C17-65AB-4D90-B4E7-C0FFEE000002</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>
`

  // no Content-Disposition on purpose: `attachment` makes some iOS versions
  // save the profile to Files instead of opening the installer prompt
  return new Response(profile, {
    headers: {
      'Content-Type': 'application/x-apple-aspen-config; charset=utf-8',
    },
  })
}
