import { json } from "@remix-run/node";
import { Link, useActionData, useTransition, useFetcher } from "@remix-run/react";

export async function action({ request }) {
  const formData = await request.formData();
  const search = formData.get("search");

  if (typeof search !== "string" || search.length === 0) {
    return json(
      { errors: { search: "Search is required", body: null } },
      { status: 400 }
    );
  }

  const req = await fetch(
    `https://api.prod.airc.it/api/pages?vertical=main&crossvertical=1&search=${search}`
  );
  const { data } = await req.json();
  const results = data.map(res => {
    const featuredimage = res.featuredimage ? res.featuredimage.url : null
    const image = featuredimage ? featuredimage.startsWith('/') ? `https://aircs3.imgix.net${featuredimage}` : featuredimage : null
    return {
      title: res.title,
      url: res.url,
      image
    }
  })
  return json({ results, status: 200 });
}

export default function SearchPage() {
  const fetcher = useFetcher()
  
  const handleInputChange = (event) => {
    const { value } = event.target
    if (value.length > 2) {
      fetcher.submit(event.target.form)
    }
  }

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Instant Search</Link>
        </h1>
      </header>

      <main className="p-16 h-full bg-white">
        <fetcher.Form
          method="post"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
          }}
        >
          <div>
            <label className="flex w-full flex-col gap-1">
              <span>Search: </span>
              <input
                name="search"
                className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                aria-invalid={fetcher.data?.errors?.title ? true : undefined}
                onChange={handleInputChange}
                aria-errormessage={
                  fetcher.data?.errors?.title ? "title-error" : undefined
                }
              />
            </label>
            {fetcher.data?.errors?.search && (
              <div className="pt-1 text-red-700" id="search-error">
                {fetcher.data.errors.search}
              </div>
            )}
          </div>

          <div className="text-center">
            <p>{fetcher.state === 'submitting' ? 'Searching...' : ''}</p>
          </div>
        </fetcher.Form>
        <div className="mt-8">
          <ul>
            { fetcher.data && fetcher.data.results ? fetcher.data.results.map((result, i) => {
              return (
                <li key={i} className="p-4 border border-r-4 my-2">
                  <div className="flex justify-between">
                    { result.image ? (
                      <img className="h-48 mr-4 w-6/12 object-cover" height="200" width="auto" src={result.image} alt={result.title} />
                    ) : null}
                    <a className="w-6/12" href={result.url}>{result.title}</a>
                  </div>
                </li>
              )
            }) : null }
          </ul>
        </div>
      </main>
    </div>
  );
}
