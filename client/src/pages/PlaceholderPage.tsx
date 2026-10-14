// Temporary page so sidebar links don't 404 before the real page exists
const PlaceholderPage = ({ title }: { title: string }) => (
  <div>
    <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
    <p className="mt-1 text-sm text-muted-foreground">This page is coming soon.</p>
  </div>
);

export default PlaceholderPage;