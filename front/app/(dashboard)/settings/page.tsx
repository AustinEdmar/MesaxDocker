export default function Settings() {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Configurações</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium">Notificações</h2>
            <p className="mt-2 text-gray-600">Gerencie suas configurações de notificações</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium">Interface</h2>
            <p className="mt-2 text-gray-600">Personalize sua interface</p>
          </div>
        </div>
      </div>
    )
  }