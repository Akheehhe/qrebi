export const BRAND_NAME = "MyBus";
export const BRAND_DOMAIN = "mybus.ge";
export const BRAND_TAGLINE = "საქართველოს ავტობუსები და მიკროავტობუსები ერთ სივრცეში";

export const CITIES = [
  "თბილისი",
  "ბათუმი",
  "ქუთაისი",
  "ზუგდიდი",
  "თელავი",
  "გორი",
  "ბორჯომი",
  "ახალციხე",
  "მესტია",
  "სიღნაღი",
  "ყვარელი",
  "ფოთი",
  "ოზურგეთი",
  "ამბროლაური",
  "გუდაური",
  "სტეფანწმინდა",
  "რუსთავი",
  "ხაშური",
  "სამტრედია",
  "ლაგოდეხი",
  "წყალტუბო",
  "ბაკურიანი",
  "ახალქალაქი",
  "მარნეული",
] as const;

export const STATION_SUGGESTIONS = [
  "დიდუბის ავტოსადგური",
  "ორთაჭალის ავტოსადგური",
  "სამგორის ავტოსადგური",
  "ცენტრალური ავტოსადგური",
  "საბურთალოს გაჩერება",
];

export const SEAT_OPTIONS = [1, 2, 3, 4] as const;

export const PAYMENT_METHODS = [
  { value: "online", label: "ონლაინ გადახდა ბარათით" },
  { value: "cash", label: "ნაღდი ფული მძღოლთან" },
] as const;
