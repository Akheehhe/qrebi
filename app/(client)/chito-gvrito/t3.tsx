/* Trilingual text, page-scoped. Same idea as the main site's T — every
   language ships in the HTML and CSS shows exactly one, driven by a class
   on <body> (none = ka, cg-en, cg-ru) — extended to the third language the
   restaurant's guests actually speak. Rules live in chito.css. */
export function T3({
  ka,
  en,
  ru,
}: {
  ka: React.ReactNode
  en: React.ReactNode
  ru: React.ReactNode
}) {
  return (
    <>
      <span className="cg-t-ka" lang="ka">{ka}</span>
      <span className="cg-t-en" lang="en">{en}</span>
      <span className="cg-t-ru" lang="ru">{ru}</span>
    </>
  )
}
