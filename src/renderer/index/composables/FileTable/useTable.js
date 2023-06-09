import {computed, ref, watch, watchEffect} from 'vue';

export default function useTable({props}) {
  const defaultCurrentPage = 1;
  const defaultPageSize = Number(localStorage.getItem('pageSize') || 10);

  const currentPage = ref(Number.isNaN(defaultCurrentPage) ? 1 : defaultCurrentPage);
  const pageSize = ref(Number.isNaN(defaultPageSize) ? 10 : defaultPageSize);

  const tableData = ref([]);

  const calculateIndex = (index) => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return startIndex + index + 1;
  };

  const handleSizeChange = (val) => {
    localStorage.setItem('pageSize', pageSize.value);
  };
  const handleCurrentChange = (val) => {
    localStorage.setItem('pageSize', pageSize.value);
  };

  const stop = watchEffect(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    tableData.value = props.data.slice(startIndex, endIndex).map((item) => {
      return {
        ...item,
        pagination: {total: props.data.length, currentPage: currentPage.value, pageSize: pageSize.value}
      };
    });
  });
  stop();

  return {
    defaultCurrentPage,
    defaultPageSize,
    currentPage,
    pageSize,
    tableData,
    calculateIndex,
    handleSizeChange,
    handleCurrentChange
  };
}
