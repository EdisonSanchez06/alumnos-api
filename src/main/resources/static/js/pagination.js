function paginate(data,page=1,size=5){
  const start = (page-1)*size;
  const end = start+size;
  return data.slice(start,end);
}
