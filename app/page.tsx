import DiagnosticoInteligente from "@/components/DiagnosticoInteligente";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-black text-white flex flex-col">
      <section className="flex flex-col items-center justify-center py-32 px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Diagnóstico Inteligente Soo Tech
        </h1>

        <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mb-10">
          Usamos Inteligência Artificial, estratégia e engenharia para transformar
          desafios tecnológicos em oportunidades reais de crescimento.
        </p>

        <div className="flex gap-4">
          <a
            href="#diag"
            className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-gray-200 transition"
          >
            Começar Diagnóstico
          </a>

          <a
            href="https://wa.me/5511976970021?text=Quero%20um%20diagn%C3%B3stico%20de%20IA"
            target="_blank"
            className="border border-white font-semibold px-6 py-3 rounded-xl hover:bg-white hover:text-black transition"
          >
            Falar com Especialista
          </a>
        </div>
      </section>

      <section id="diag" className="flex justify-center items-start pb-32 px-4">
        <div className="max-w-3xl w-full">
          <DiagnosticoInteligente />
        </div>
      </section>
    </main>
  );
}
