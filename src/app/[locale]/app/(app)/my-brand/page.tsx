import React from "react";

const MyBrandPage = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Your saved assets</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Aquí podrás encontrar todas las marcas y recursos generados previamente. Comienza creando
        una nueva marca o accede a las existentes desde esta sección.
      </p>
    </div>
  );
};

export default MyBrandPage;
