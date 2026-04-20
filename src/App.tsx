import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Library from './views/Library';
import NewRun from './views/NewRun';
import RunDetail from './views/RunDetail';
import FoundationDoc from './views/FoundationDoc';

type Route =
  | { name: 'library' }
  | { name: 'new-run' }
  | { name: 'run-detail'; runId: string }
  | { name: 'foundation-doc'; runId: string };

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');
  if (!path || path === '/') return { name: 'library' };
  if (path === 'ny') return { name: 'new-run' };

  const foundationMatch = path.match(/^kjoring\/([^/]+)\/grunnlag$/);
  if (foundationMatch) return { name: 'foundation-doc', runId: foundationMatch[1] };

  const detailMatch = path.match(/^kjoring\/([^/]+)$/);
  if (detailMatch) return { name: 'run-detail', runId: detailMatch[1] };

  return { name: 'library' };
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <Layout>
      {route.name === 'library' && <Library />}
      {route.name === 'new-run' && <NewRun />}
      {route.name === 'run-detail' && <RunDetail runId={route.runId} />}
      {route.name === 'foundation-doc' && <FoundationDoc runId={route.runId} />}
    </Layout>
  );
}
