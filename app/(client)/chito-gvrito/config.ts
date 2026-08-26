/* ─── everything a link swap ever touches ────────────────────────────────
   Shared by the page and the iOS Wi-Fi profile route, so the credentials
   live in exactly one place. */

export const LINKS = {
  // TODO: მენიუს საბოლოო ბმული ცალკე მოგვეწოდება — მანამდე Wolt-ის გვერდი დგას
  menu: 'https://wolt.com/en/geo/tbilisi/restaurant/chito-gvrito',
  // the restaurant's own Google Business review link
  review:
    'https://search.google.com/local/writereview?placeid=ChIJHaT7HgANREAR7AeA4wujrMM',
  maps:
    'https://www.google.com/maps/search/?api=1&query=Chito%20Gvrito%2C%20Sioni%20Street%208%2C%20Tbilisi&query_place_id=ChIJHaT7HgANREAR7AeA4wujrMM',
  wifi: { ssid: 'konka', password: 'konka2025' } as
    | { ssid: string; password: string }
    | null,
}
