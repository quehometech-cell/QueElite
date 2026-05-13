export const metadata = {
  title: "Getcha Right Transformations",
  description: "Online & Hybrid Strength Coaching",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        background: "#0a0a0a",
        color: "#f5f5f5",
        fontFamily: "Arial, sans-serif"
      }}>
        {children}
      </body>
    </html>
  );
}