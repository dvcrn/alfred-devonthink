const devonthink = Application('DEVONthink Pro');

const MAX_RESULTS_PER_DB = 10;

function doSearch(db, query) {
  results =  devonthink.search(query, {
    in: db.root(),
  });

  if (results.length == 0)  {
    return [];
  }

  const parsed = [];
  for (var result in results) {
    const current = results[result];
    parsed.push({
      name: current.name(),
      id: current.uuid(),
      databaseName: current.database().name(),
      url: current.referenceURL(),
      path: current.path(),
      location: current.location(),
      score: current.score(),
    });

    if (parsed.length >= MAX_RESULTS_PER_DB) {
      break;
    }
  }


  return parsed;
}


function run(argv) {
  const query = argv[0];
  const dbs = devonthink.databases();
  const found = dbs.map((db) => doSearch(db, query));
  let results = [];
  for (const db of dbs) {
    results = results.concat(doSearch(db, query));
  }

  results.sort(function(a, b) {
      return b.score - a.score;
  })

  const items = results.map(function(element) {
    return {
      title: element.name,
      subtitle: `Found in ${element.databaseName}${element.location}, score ${element.score}`,
      arg: element.url,
      icon: {
        type: "fileicon",
        path: element.path,
      }
    }
  });

  if (items.length === 0) {
    items.push({
      title: "No Results",
      uid: "no-results",
    });
  }

  return JSON.stringify({
    "items": items,
  })
}

