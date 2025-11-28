import './globals.css'
/**
 * Provides the HTML document scaffold and renders the given React nodes inside the body.
 *
 * @param children - React nodes to render inside the document `<body>`.
 * @returns The root `<html lang="en">` element containing a `<body>` with `children`.
 */
export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>
}