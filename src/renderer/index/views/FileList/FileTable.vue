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
    <el-table-column
      v-for="propertiesItem in propertiesArray"
      :reserve-selection="propertiesItem.reserveSelection"
      :index="propertiesItem.index"
      :key="propertiesItem.prop"
      :prop="propertiesItem.prop"
      :label="propertiesItem.label"
      :type="propertiesItem.type"
      :width="propertiesItem.width"
      :align="propertiesItem.align">
      <template v-if="propertiesItem.prop === 'startTime'" #default="scope">
        {{ scope.row.startTime ? dayjs(scope.row.startTime).format('YYYY/MM/DD HH:mm:ss') : '' }}
      </template>

      <template v-if="propertiesItem.prop === 'name'" #default="scope">
        <span
          class="file-name text-ellipsis"
          @click="handleShowRowFolder(scope.row.path)"
          :data-id="scope.row.id"
          :title="scope.row.path"
          >{{ scope.row.name }}</span
        >
      </template>

      <template v-if="propertiesItem.prop === 'size'" #default="scope">
        {{ bytes(scope.row.size) }}
      </template>
      <template v-if="propertiesItem.prop === 'status'" #default="scope">
        <el-tag class="disabled-transitions" :type="MAP_STATUS.get(scope.row.status).tag">{{
          MAP_STATUS.get(scope.row.status).text
        }}</el-tag>
      </template>
      <template v-if="propertiesItem.prop === 'progress'" #default="scope">
        <div class="progress-wrap">
          <el-progress :percentage="scope.row.progress" :format="(percentage) => percentage.toFixed(1) + '%'" />
        </div>
      </template>

      <template v-if="propertiesItem.prop === 'operations'" #default="scope">
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
import {ref, nextTick} from 'vue';
import dayjs from 'dayjs';
import useElectron from '@/renderer/index/composables/useElectron.js';
import {MAP_STATUS} from '@/renderer/index/utils/constant.js';
import bytes from 'bytes';
import useTable from '@/renderer/index/composables/FileTable/useTable.js';
import useSortable from '@/renderer/index/composables/FileTable/useSortable.js';
import useIntersectionObserver from '@/renderer/index/composables/useIntersectionObserver.js';

const {handleResultFolder, handleShowRowFolder} = useElectron();

const props = defineProps({
  data: {type: Array, required: true, default: () => []},
  total: {type: Number, required: true, default: 0}
});
const tableRef = ref();

const {currentPage, pageSize, tableData, calculateIndex, handleSizeChange, handleCurrentChange} = useTable({props});

const {propertiesArray} = useSortable({tableData, tableRef, calculateIndex});
useIntersectionObserver({
  tableData,
  tableRef,
  loadMoreCallback
});
let isLoading = false;
async function loadMoreCallback(lastItem) {
  // console.log('lastItem', lastItem);
  // 如果滚动到底部的数据不是最后一页，那么加载更多
  const pagination = lastItem.pagination;
  console.log('pagination', pagination);
  if (pagination.total > pagination.currentPage * pagination.pageSize && !isLoading) {
    isLoading = true;
    console.log('pagination1');

    // 还有数据尚未加载完成，执行加载更多操作
    const currentPageNum = pagination.currentPage + 1;
    const startIndex = (currentPageNum - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    const currentArray = props.data.slice(startIndex, endIndex).map((item) => {
      return {
        ...item,
        pagination: {total: props.data.length, currentPage: currentPageNum, pageSize: pageSize.value}
      };
    });

    tableData.value = tableData.value.concat(...currentArray).slice(-30);
    currentPage.value = currentPageNum;

    await nextTick();

    const lastSelector = `[data-id="${lastItem.id}"]`;
    const lastRow = document.querySelector(lastSelector);
    lastRow && lastRow.scrollIntoViewIfNeeded();
    isLoading = false;
  } else {
    // 已经全部加载完成，不做处理
    console.log('pagination2');
  }
}

const onRowClick = (row) => {
  console.log('[onRowClick]', JSON.parse(JSON.stringify(row)));
};

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
.text-ellipsis {
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis; //溢出用省略号显示
  display: -webkit-box;
  -webkit-line-clamp: 3; // 超出多少行
  -webkit-box-orient: vertical;
}
</style>
