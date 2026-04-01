import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TriangularProgram } from '@/components/programs/TriangularProgram';
import { CubicProgram } from '@/components/programs/CubicProgram';
import { MachinesProgram } from '@/components/programs/MachinesProgram';
import { WarehouseProgram } from '@/components/programs/WarehouseProgram';

export const metadata = {
  title: 'Sistema de Simulación de Sistemas - UMSS',
  description: 'Aplicación interactiva para simulación y análisis de sistemas',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            🎲 Simulación de Sistemas
          </h1>
          <p className="text-lg text-slate-600 mb-1">
            Universidad Mayor de San Simón - Carrera de Ingeniería de Sistemas
          </p>
          <p className="text-sm text-slate-500">
            Taller de Simulación de Sistemas (G1) - Actividad 1
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="programa1" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white shadow-md rounded-lg p-1">
            <TabsTrigger value="programa1" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              📐 Triangular
            </TabsTrigger>
            <TabsTrigger value="programa2" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              ∛ Cúbica
            </TabsTrigger>
            <TabsTrigger value="programa3" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              🔧 Máquinas
            </TabsTrigger>
            <TabsTrigger value="programa4" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              🚚 Almacén
            </TabsTrigger>
          </TabsList>

          {/* Programa 1: Triangular */}
          <TabsContent value="programa1">
            <TriangularProgram />
          </TabsContent>

          {/* Programa 2: Cúbica */}
          <TabsContent value="programa2">
            <CubicProgram />
          </TabsContent>

          {/* Programa 3: Máquinas */}
          <TabsContent value="programa3">
            <MachinesProgram />
          </TabsContent>

          {/* Programa 4: Almacén */}
          <TabsContent value="programa4">
            <WarehouseProgram />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-600">
          <p className="mb-2">
            Basado en el libro: <span className="font-semibold">"Simulación: Un enfoque práctico"</span> de Raúl Coss Bu
          </p>
          <p>Implementación con Node.js, TypeScript, React y Next.js 16</p>
          <p className="mt-4 text-xs text-slate-500">
            Desarrollado por: Sistema de Simulación - 2026
          </p>
        </div>
      </div>
    </div>
  );
}
