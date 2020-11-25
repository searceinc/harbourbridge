// Home screen component
const HomeComponent = {
    render: (params) => homeScreen(params)
  } 
  
// Edit Schema screen component
const SchemaComponent = {
  render: (params) => schemaReport(params)
} 

// Error component (for any unrecognized path)
const ErrorComponent = {
  render: () => {
    return `
      <section>
        <h1>Error</h1>
      </section>
    `;
  }
}

// Pre defined routes 
const routes = [
{ path: '/', component: HomeComponent, },
{ path: '/schema-report-connect-to-db', component: SchemaComponent, },
{ path: '/schema-report-load-db-dump', component: SchemaComponent, },
{ path: '/schema-report-import-db', component: SchemaComponent, },
{ path: '/schema-report-resume-session', component: SchemaComponent, },
];

// function to fetch browser url
const parseLocation = () => location.hash.slice(1).toLowerCase() || '/';

// function to find component based on browser url
const findComponentByPath = (path, routes) => routes.find(r => r.path.match(new RegExp(`^\\${path}$`, 'gm'))) || undefined;

// function to render the html based on path
const router = () => {
  const path = parseLocation();
  const { component = ErrorComponent } = findComponentByPath(path, routes) || {};

  if (path == '/schema-report-connect-to-db') {
    showSchemaAssessment(event.type);
  }
  else if (path == '/schema-report-load-db-dump') {
    onLoadDatabase(localStorage.getItem('globalDbType'), localStorage.getItem('globalDumpFilePath'), event.type)
  }
  else if (path == '/schema-report-import-db') {
    onImport()
  }
  else if (path == '/schema-report-resume-session') {
    resumeSession(localStorage.getItem('driver'), localStorage.getItem('path'), localStorage.getItem('fileName'), localStorage.getItem('sourceDb'));
  }
  else {
    document.getElementById('app').innerHTML = component.render();
  }
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);