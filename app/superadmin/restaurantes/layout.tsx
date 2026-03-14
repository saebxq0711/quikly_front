export default function RestaurantesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Restaurantes
      </h1>
      {children}
    </div>
  );
}
