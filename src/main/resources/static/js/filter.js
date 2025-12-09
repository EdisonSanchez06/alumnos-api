function searchGlobal(rows, query){
  query=query.toLowerCase();
  return rows.filter(r =>
    Object.values(r).join(" ").toLowerCase().includes(query)
  );
}

function filterAdvanced(rows,filters){
  return rows.filter(r=>{
    return Object.entries(filters).every(([k,v])=>{
      if(!v) return true;
      return (r[k] || "").toLowerCase().includes(v.toLowerCase());
    });
  });
}
