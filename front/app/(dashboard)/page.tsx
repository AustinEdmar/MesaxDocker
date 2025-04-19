export default function Dashboard() {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Bem-vindo ao Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium">Estatísticas</h2>
            <p className="mt-2 text-gray-600">Visualize suas estatísticas principais</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium">Atividade Recente</h2>
            <p className="mt-2 text-gray-600">Veja suas atividades mais recentes</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium">Tarefas</h2>
            <p className="mt-2 text-gray-600">Gerencie suas tarefas pendentes</p>
          </div>
        </div>
      
      </div>
    )
  }