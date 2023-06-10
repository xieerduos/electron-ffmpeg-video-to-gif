import {onMounted, ref, onBeforeUnmount} from 'vue';

import Sortable from 'sortablejs';

export default function useSortable({tableData, tableRef, calculateIndex}) {
  const sortableInstanceRow = ref(null);
  const sortableInstanceColumn = ref(null);

  const propertiesArray = ref([
    {prop: 'selection', type: 'checkbox', label: '', reserveSelection: true, width: '55px', align: 'center'},
    // {prop: 'index', type: 'seq', label: '序号', index: calculateIndex, width: '70px', align: 'center'},
    {prop: 'startTime', type: '', label: '日期', width: '114px', align: ''},
    {prop: 'id', type: '', label: '任务ID', width: '100px', align: 'center'},
    {prop: 'name', type: '', label: '文件名称', width: '', align: ''},
    {prop: 'size', type: '', label: '大小', width: '', align: 'center'},
    {prop: 'status', type: '', label: '状态', width: '100px', align: 'center'},
    {prop: 'progress', type: '', label: '完成进度', width: '', align: ''},
    {prop: 'operations', type: '', label: '操作', width: '100px', align: 'center'}
  ]);

  // onMounted(() => {
  //   try {
  //     let sortPropertiesBy = localStorage.getItem('sortPropertiesBy');

  //     if (sortPropertiesBy) {
  //       sortPropertiesBy = JSON.parse(sortPropertiesBy);

  //       propertiesArray.value = sortArrayByProperties(propertiesArray.value, sortPropertiesBy);
  //     }
  //   } catch (error) {
  //     console.error('[onMounted set propertiesArray error]', error);
  //   }
  // });

  // onMounted(() => {
  //   // const tbody = tableRef.value.$el.querySelector('.el-table__body-wrapper tbody');
  //   const tbody = tableRef.value.$el.querySelector('.vxe-table--body-wrapper tbody');
  //   if (tbody) {
  //     sortableInstanceRow.value = Sortable.create(tbody, {
  //       animation: 150,
  //       onEnd: ({newIndex, oldIndex}) => {
  //         const currRow = tableData.value.splice(oldIndex, 1)[0];
  //         tableData.value.splice(newIndex, 0, currRow);
  //       }
  //     });
  //   }

  //   // const thead = tableRef.value.$el.querySelector('.el-table__header-wrapper thead tr');
  //   const thead = tableRef.value.$el.querySelector('.vxe-table--header-wrapper thead tr');
  //   if (thead) {
  //     sortableInstanceRow.value = Sortable.create(thead, {
  //       animation: 150,
  //       onMove: () => {},
  //       onUpdate: () => {},
  //       onSort: () => {},
  //       onEnd: ({newIndex, oldIndex}) => {
  //         // 获取表格列定义
  //         const table = tableRef.value;
  //         const oldColumns = table.store.states.columns;

  //         // 重新排列列定义的顺序
  //         const newColumns = [...oldColumns.value];
  //         const movedColumn = newColumns.splice(oldIndex, 1)[0];
  //         newColumns.splice(newIndex, 0, movedColumn);

  //         oldColumns.value = newColumns;

  //         localStorage.setItem('sortPropertiesBy', JSON.stringify(oldColumns.value.map((item) => item.property)));
  //       }
  //     });
  //   }
  // });

  // onBeforeUnmount(() => {
  //   if (sortableInstanceRow.value) {
  //     sortableInstanceRow.value.destroy();
  //     sortableInstanceRow.value = null;
  //   }
  //   if (sortableInstanceColumn.value) {
  //     sortableInstanceColumn.value.destroy();
  //     sortableInstanceColumn.value = null;
  //   }
  // });
  return {
    sortableInstanceRow,
    sortableInstanceColumn,
    propertiesArray
  };
}

export function sortArrayByProperties(objArray, sortPropertiesBy) {
  const sortOrder = {};
  for (let i = 0; i < sortPropertiesBy.length; i++) {
    sortOrder[sortPropertiesBy[i]] = i;
  }

  return objArray.sort((a, b) => {
    return sortOrder[a.prop] - sortOrder[b.prop];
  });
}
