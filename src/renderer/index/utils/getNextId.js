const getNextId = () => {
  let nextId = localStorage.getItem('nextId') || 0;
  nextId++;
  localStorage.setItem('nextId', nextId);
  return nextId;
};

export default getNextId;
