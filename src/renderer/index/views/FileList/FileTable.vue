<template>
  <el-table
    ref="tableRef"
    :data="tableData"
    :row-key="(row) => row.id"
    @row-contextmenu="onRowClick"
    v-bind="$attrs"
    v-on="$attrs"
    height="calc(100vh - 160px - 40px)"
    style="width: 100%">
    <el-table-column type="selection" reserve-selection width="55" align="center" />
    <el-table-column type="index" :index="calculateIndex" label="序号" width="55" align="center" />
    <el-table-column prop="startTime" label="日期" width="114px">
      <template #default="scope">
        {{ scope.row.startTime ? dayjs(scope.row.startTime).format('YYYY/MM/DD HH:mm:ss') : '' }}
      </template>
    </el-table-column>
    <el-table-column prop="id" label="任务ID" width="70" align="center" />
    <el-table-column prop="name" label="文件名称">
      <template #default="scope">
        <span class="file-name" @click="handleShowRowFolder(scope.row.path)" :title="scope.row.path">{{
          scope.row.name
        }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="size" label="大小" width="100px">
      <template #default="scope">
        {{ bytes(scope.row.size) }}
      </template>
    </el-table-column>
    <el-table-column prop="status" label="状态" align="center" width="100px">
      <template #default="scope">
        <el-tag class="disabled-transitions" :type="MAP_STATUS.get(scope.row.status).tag">{{
          MAP_STATUS.get(scope.row.status).text
        }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="progress" label="完成进度" align="left">
      <template #default="scope">
        <div class="progress-wrap">
          <el-progress :percentage="scope.row.progress" :format="(percentage) => percentage.toFixed(1) + '%'" />
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="" label="操作" align="center" width="100px">
      <template #default="scope">
        <el-button
          @click="handleResultFolder(scope.row)"
          :disabled="scope.row.status !== 2"
          text
          :title="scope.row.path"
          ><el-icon><Folder /></el-icon
        ></el-button>
      </template>
    </el-table-column>
  </el-table>
  <p>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 30]"
      :total="total"
      background
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </p>
</template>
<script setup>
import {onMounted, defineExpose, computed, ref, onBeforeUnmount} from 'vue';
import dayjs from 'dayjs';
import useElectron from '@/renderer/index/composables/useElectron.js';
import {MAP_STATUS} from '@/renderer/index/utils/constant.js';
import bytes from 'bytes';
import Sortable from 'sortablejs';

const {handleResultFolder, handleShowRowFolder} = useElectron();

const props = defineProps({
  data: {type: Array, required: true, default: () => []},
  total: {type: Number, required: true, default: 0}
});

const defaultCurrentPage = 1;
const defaultPageSize = Number(localStorage.getItem('pageSize') || 10);

const currentPage = ref(Number.isNaN(defaultCurrentPage) ? 1 : defaultCurrentPage);
const pageSize = ref(Number.isNaN(defaultPageSize) ? 10 : defaultPageSize);

const tableData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return props.data.slice(startIndex, endIndex);
});

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

const onRowClick = (row) => {
  console.log('[onRowClick]', JSON.parse(JSON.stringify(row)));
};

const tableRef = ref();
const sortableInstanceRow = ref(null);
const sortableInstanceColumn = ref(null);

onMounted(() => {
  sortableInstanceRow.value = Sortable.create(tableRef.value.$el.querySelector('.el-table__body-wrapper tbody'), {
    animation: 150,
    onEnd: ({newIndex, oldIndex}) => {
      const currRow = tableData.value.splice(oldIndex, 1)[0];
      tableData.value.splice(newIndex, 0, currRow);
    }
  });
  sortableInstanceRow.value = Sortable.create(tableRef.value.$el.querySelector('.el-table__header-wrapper thead tr'), {
    animation: 150,
    onMove: () => {},
    onUpdate: () => {},
    onSort: () => {},
    onEnd: ({newIndex, oldIndex}) => {
      // 获取表格列定义
      const table = tableRef.value;
      const oldColumns = table.store.states.columns;

      // 重新排列列定义的顺序
      const newColumns = [...oldColumns.value];
      const movedColumn = newColumns.splice(oldIndex, 1)[0];
      newColumns.splice(newIndex, 0, movedColumn);

      oldColumns.value = newColumns;
    }
  });
});

onBeforeUnmount(() => {
  if (sortableInstanceRow.value) {
    sortableInstanceRow.value.destroy();
    sortableInstanceRow.value = null;
  }
  if (sortableInstanceColumn.value) {
    sortableInstanceColumn.value.destroy();
    sortableInstanceColumn.value = null;
  }
});

defineExpose({
  getTableRef: () => tableRef.value
});
</script>
<style lang="scss" scoped>
.disabled-transitions {
  transition: none !important;
}

.file-name {
  cursor: pointer;
}
.progress-wrap ::v-deep(.el-progress__text) {
  width: 60px;
  font-size: 12px;
}
</style>
