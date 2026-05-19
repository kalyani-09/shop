import { Header } from '../components/header'
import { Footer } from '../components/footer'
import womenShoppingOnline from "../assets/woman-shopping-online.jpeg";
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-8 pb-16 pt-20">
        <section className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col justify-center text-left">
            <div className="mb-6 inline-flex items-center gap-2   px-3 py-1 text-xs text-slate-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-600" />
              Spring drop · Free shipping over $100
            </div>

            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
              Considered objects <br />
              for a <span className="text-indigo-600">quietly modern</span>
              <br />
              life.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
              Hand-picked electronics, fashion, and home goods from independent
              makers. One shop. Zero noise.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Shop the collection
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M13 5a1 1 0 0 1 1.7-.7l6 6a1 1 0 0 1 0 1.4l-6 6A1 1 0 0 1 13 17v-4H4a1 1 0 1 1 0-2h9V7a1 1 0 0 1 0-2Z"
                  />
                </svg>
              </Link>

              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Explore electronics
              </Link>

              <Link
                to="/reels"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Browse Reels
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path fill="currentColor" d="M8 5v14l11-7z" />
                </svg>
              </Link>
            </div>


            <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M20 8h-3.1A5 5 0 0 0 7.1 8H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7h1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1Zm-8-4a3 3 0 0 1 2.8 2H9.2A3 3 0 0 1 12 4Zm5 17H7v-8h10v8Zm2-10H5v-1h14v1Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Free shipping
                  </p>
                  <p className="text-xs text-slate-600">Orders $100+</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M12 6a6 6 0 1 0 6 6a6 6 0 0 0-6-6Zm0 10a4 4 0 1 1 4-4a4 4 0 0 1-4 4Zm8.7-5a1 1 0 0 1 0 2h-1.5a7.97 7.97 0 0 1-2.3 4.6l1 1a1 1 0 0 1-1.4 1.4l-1-1A7.97 7.97 0 0 1 13 20.2V21.7a1 1 0 0 1-2 0v-1.5A7.97 7.97 0 0 1 6.4 18l-1 1A1 1 0 0 1 4 17.6l1-1A7.97 7.97 0 0 1 3.8 13H2.3a1 1 0 0 1 0-2h1.5A7.97 7.97 0 0 1 6 6.4l-1-1A1 1 0 1 1 6.4 4l1 1A7.97 7.97 0 0 1 11 3.8V2.3a1 1 0 0 1 2 0v1.5A7.97 7.97 0 0 1 18 6l1-1A1 1 0 0 1 20.4 6.4l-1 1A7.97 7.97 0 0 1 20.2 11Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    30-day returns
                  </p>
                  <p className="text-xs text-slate-600">No questions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M12 2a7 7 0 0 0-7 7v4a2 2 0 0 0 2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-5a2 2 0 0 0 2-2V9a7 7 0 0 0-7-7Zm5 11H7V9a5 5 0 0 1 10 0v4Zm-1 2v5H8v-5h8Zm-4 1a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Secure checkout
                  </p>
                  <p className="text-xs text-slate-600">Encrypted</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="w-[600px] h-[450px] overflow-hidden rounded-2xl bg-slate-100 shadow-2xl">
              <img
                src={womenShoppingOnline}
                alt="Women shopping online"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

