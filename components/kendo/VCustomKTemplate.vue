<script lang="ts">

export const VTemplateUtils = {
  commaNum : function(value:number, format?:string){
    format = format === undefined ? "" : PageUtils.isNull(format, "")

    value = PageUtils.isNull4Num(value, 0)
    let numVal = (value === undefined ? 0 : value) //1000000.123;
    //console.log("commaNum....", price)
    if(format === NUMBER_FORMAT.RATE_PERCENT){ 
      return numVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + "%"
    }else if(format === NUMBER_FORMAT.BUDGET_AMT){
      numVal = Math.floor(numVal) // 원단위 
      return numVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }else if(format === NUMBER_FORMAT.BUDGET_SHORT_AMT){
      numVal = MathUtils.toFixed4BudgetAmt(numVal, 100) // 억단위, 소수이하 백만단위까지 표시 
      return numVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }else if(format !== ""){  // format
      let result = numVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

      const resultArr = result.split(".")
      if(resultArr.length >= 2){
        let decimalPoint = resultArr[1]

        if(format === NUMBER_FORMAT.DECIMAL_POINT_0){
          result = resultArr[0]
        }else{
          if(format === NUMBER_FORMAT.DECIMAL_POINT_1) decimalPoint = StringUtils.rpad(decimalPoint, 1, "0")
          if(format === NUMBER_FORMAT.DECIMAL_POINT_2) decimalPoint = StringUtils.rpad(decimalPoint, 2, "0")
          if(format === NUMBER_FORMAT.DECIMAL_POINT_3) decimalPoint = StringUtils.rpad(decimalPoint, 3, "0")
          result = resultArr[0] + "." + decimalPoint
        }
      }
      return result
    }else{
      let result = numVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return result
    }
  },
  
}
</script>

<script setup lang="ts">
import { NUMBER_FORMAT, TEXT_FORMAT } from '@/gs-caltex/core/libs/constants';
import { DateUtils, MathUtils, PageUtils, StringUtils } from '@/gs-caltex/core/libs/utils';
import { useCodeStore } from '@/gs-caltex/core/store/useCommStore';
import 'vue3-treeselect/dist/vue3-treeselect.css';

const codeStore = useCodeStore()
const storeTreeCodeItems:any = codeStore.getTreeCodeList

interface Emit {
  (e: 'update:columnProps', value: any): void,
  (e: 'update:dataItem', value: any): void,  
  (e: 'colums', value: any): void,
  (e: 'templateKind', value: string): void,  
  (e: 'update:selectedRows', selectedRows?: string[]): void,    
  (e: 'update:componentKey', componentKey?:number): void,   
  (e: 'selectComponentKey', selectComponentKey?:number): void, 
  (e: 'allSelected4Check', allSelected4Check?:boolean): void,    
  (e: 'isMultiSelect4Check', isMultiSelect4Check?:boolean): void,         
  (e: 'select4Check', select4Check?:boolean): void,    
}

interface Props {
  columnProps: any,
  dataItem: any,
  colums: any,
  templateKind: string,  
  selectedRows?: string[],
  componentKey?: number,
  allSelected4Check?: boolean,   
  isMultiSelect4Check?: boolean,  
  select4Check?: boolean,      
  selectComponentKey?: number,
  gridType?: string,
}

//const props = defineProps<Props>()
const props = withDefaults(defineProps<Props>(), {
  selectComponentKey: 0,
  allSelected4Check: false,  //전체 선택 변경 알림...
  isMultiSelect4Check: true,  // 기본은 멀티 선택 
  componentKey: 0, 
  select4Check: false,  // 행 선택 알림... 
  gridType: "grid",      // grid , tree (tree-list)
})

//const emit = defineEmits<Emit>()
const emit = defineEmits<{
  (e: 'update:columnProps', columnProps: any): void,
  (e: 'update:dataItem', dataItem: any): void,
  (e: 'update:selectedRows', selectedRows?: string[]): void,
  (e: 'update:componentKey', componentKey: number): void,  
  
  (e: 'clickLink', event:any, item:any, field:string): void,
  (e: 'checkRow', event:any, item: any, uuid:string): void,  
  (e: 'checkAllRow', event:any, selectedRows:string[], allSelected:boolean): void,  
  (e: 'selectChange4KCombo', selectObject:any, rowIndex:number): void,    
  (e: 'onValueChanged', event:any, itemObject:any, field:string, oldValue:any): void,     
}>()

const templateKind = ref(props.templateKind.toUpperCase()) // template type 
const columnProps = ref(props.columnProps)
const selectedRows = ref(props.selectedRows)
const selectedRows2 = ref<string[]>([])
const rowIndex = ref(-1)
const componentKey = ref(props.componentKey)
const componentKey4AllCheck = ref(100000000)
const selectComponentKey = ref(props.selectComponentKey)
const allSelected4Check = ref(props.allSelected4Check)
const isMultiSelect4Check = ref(props.isMultiSelect4Check)
const select4Check = ref(props.select4Check)

// validate 
const number_max = ref(999999999999)
const number_min = ref(-999999999999)

const field:string = ref(columnProps.value.field)
let itemValue:any = ref()
if(columnProps.value.field !== "selected"){
  itemValue.value = columnProps.value.dataItem[columnProps.value.field]
}
let codeItems = ref()
let itemValueText = ref() 

const colums = ref(props.colums)
const columDetailProps = ref()
for(let i = 0 ; i < colums.value.length ; i++){
  if(colums.value[i].field === columnProps.value.field){
    if(colums.value[i].field === "selected"){ // select checkbox 틀고정 
      colums.value[i].locked = true
    }

    if(colums.value[i]._max !== undefined) number_max.value = colums.value[i]._max
    if(colums.value[i]._min !== undefined) number_min.value = colums.value[i]._min

    columDetailProps.value = colums.value[i] // structuredClone(toRaw(colums.value[i])) 
    break;
  }
}

// cell type : ex) link or text 
const _cellType = ref(columDetailProps.value._cellType) 
const cellType = ref()
//console.log("xxxxxxxxxxxx", columDetailProps.value, typeof(_cellType.value))
if(typeof(_cellType.value) === "function"){
  cellType.value = (_cellType.value)(columDetailProps.value.field, columnProps.value.dataItem)
  templateKind.value = cellType.value.cell.toUpperCase().replace("TEMPLATE4", "")
  //console.log("aaaaaaaaaaaaaaaaa", templateKind.value)
}

// 틀고정 
let lockedTotWidth = ref(0)
let lockedWidth = ref<any>([])
let lockedLeft = ref<any>([])
let lockedRight = ref<any>([])
let lockedColumn = ref<any>({})
let index = 0

for(let i = 0 ; i < colums.value.length ; i++){

  if(colums.value[i].locked){
    lockedWidth.value.push(colums.value[i].width)
    lockedLeft.value.push(0)
    lockedRight.value.push(0)
    lockedTotWidth.value += colums.value[i].width
    lockedColumn.value[colums.value[i].field] = index
    index++
  }
} 

let a = 0
let b = lockedTotWidth.value - lockedWidth.value[0]
lockedRight.value[0] = b 
for(let i = 0 ; i < lockedWidth.value.length ; i++){
  if(i > 0){
    //console.log("bbbb", b, lockedWidth.value[i-1]) 
    a = a + lockedWidth.value[i-1]
    lockedLeft.value[i] = a 

    if(i > 0){
      b = b - lockedWidth.value[i-0] 
      lockedRight.value[i] = b
    }
  }
} 

const multiple = ref(true)
if(!columDetailProps.value._multiple) multiple.value = false
const _editable = ref(columDetailProps.value._editable) 
const editable = ref(false)

const className = ref(columDetailProps.value.className === undefined ? "" : columDetailProps.value.className)
const format = ref(columDetailProps.value._format === undefined ? "" : columDetailProps.value._format)
const locked = ref(columDetailProps.value.locked === undefined ? false : columDetailProps.value.locked) // 틀고정 

// cell editable 
if(typeof(_editable.value) === "function"){
  editable.value = (_editable.value)(columDetailProps.value.field, columnProps.value.dataItem)
}else{
  editable.value = _editable.value
}

// icon 
const _iconType = ref(columDetailProps.value._iconType) 
const iconType = ref()
if(typeof(_iconType.value) === "function"){
  iconType.value = (_iconType.value)(columDetailProps.value.field, columnProps.value.dataItem)
}


// 수정시 키로 사용되는 필드의 경우.. 입력 컴포넌트 readoly 처리를 위해 
let readonly = ref(false) 
// if(columnProps.value.dataItem !== undefined && columnProps.value.dataItem["_rowType"] !== undefined){
//   const rowType = columnProps.value.dataItem["_rowType"]
//   for(let i = 0 ; i < colums.value.length ; i++){
//     if(colums.value[i].field === columnProps.value.field && colums.value[i]._editKey && rowType !== "I"){
//       readonly.value = true
//     }
//   } 
// }

// 입력 컴포넌트를 span 형식으로 표시
// if(columnProps.value.dataItem !== undefined && columnProps.value.dataItem["_rowType"] !== undefined){
//   const rowType = columnProps.value.dataItem["_rowType"]
//   for(let i = 0 ; i < colums.value.length ; i++){
//     if(colums.value[i].field === columnProps.value.field && colums.value[i]._editKey && rowType !== "I"){
//       editable.value = false
//     }
//   } 
// }

// 행클릭시 현재 화면상의 row Index 
if(columnProps.value.dataItem !== undefined && columnProps.value.dataItem["_rn"] !== undefined){
  rowIndex.value = Number(columnProps.value.dataItem["_rn"]) - 1  // zero=base 
}

// LINK 코드성 데이터 
const isLink4Code = ref(false)
if(templateKind.value === "LINK" && (columDetailProps.value._codeGroup !== undefined && columDetailProps.value._codeGroup !== "")){
  itemValueText.value = codeStore.getKCodeItems("TEXT", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, itemValue.value)
  isLink4Code.value = true
}

// TEXT 코드성 데이터 
const isText4Code = ref(false)
if(templateKind.value === "TEXT" && (columDetailProps.value._codeGroup !== undefined && columDetailProps.value._codeGroup !== "")){
  itemValueText.value = codeStore.getKCodeItems("TEXT", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, itemValue.value)
  isText4Code.value = true
}

if(templateKind.value === "SELECT" && editable.value){
  codeItems.value = codeStore.getKCodeItems("CODE_ITEM", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, itemValue.value)
  //console.log("codeItems.value", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, codeItems.value)
}

if(templateKind.value === "SELECT" && !editable.value){
  itemValueText.value = codeStore.getKCodeItems("TEXT", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, itemValue.value)
  //console.log("codeItems.value11", itemValue.value, itemValueText.value)
}

if(templateKind.value === "COMBO" && editable.value){
  codeItems.value = codeStore.getKCodeItems("CODE_ITEM", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, itemValue.value)
  //console.log("codeItems.value", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, codeItems.value)
}

if(templateKind.value === "COMBO" && !editable.value){
  itemValueText.value = codeStore.getKCodeItems("TEXT", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, itemValue.value)
  //console.log("codeItems.value11", itemValue.value, itemValueText.value)
}

if(templateKind.value === "KMULTICOMBO" && editable.value){
  codeItems.value = codeStore.getKCodeItems("CODE_ITEM", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, itemValue.value)
  //console.log("codeItems.value", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, codeItems.value)
}

if(templateKind.value === "KMULTICOMBO" && !editable.value){
  itemValueText.value = codeStore.getKCodeItems("TEXT", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, itemValue.value)
  //console.log("codeItems.value11", itemValue.value, itemValueText.value)
}

if(templateKind.value === "KCOMBO" && editable.value){
  codeItems.value = codeStore.getKCodeItems("CODE_ITEM", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, itemValue.value)
  //console.log("codeItems.value", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, codeItems.value)
}

if(templateKind.value === "KCOMBO" && !editable.value){
  itemValueText.value = codeStore.getKCodeItems("TEXT", columDetailProps.value._codeGroup, columDetailProps.value._codeGroupSub, itemValue.value)
  //console.log("codeItems..........", columDetailProps.value._codeGroup, itemValue.value, itemValueText.value)
}

if(templateKind.value === "TEXT" && !editable.value ){
  if(!(format.value === undefined && format.value === "")){
    const DateFormat:any = TEXT_FORMAT
    let keys = Object.keys(DateFormat); //키를 가져옵니다. 이때, keys 는 반복가능한 객체가 됩니다.
    for (let i=0; i<keys.length; i++) {
      let key:string = keys[i];
      if(DateFormat[key] === format.value){
        itemValue.value = DateUtils.getDate4Display(itemValue.value, format.value) 
        break
      }
    }
  }
}

if(templateKind.value === "TEXTAREA" && !editable.value ){
  //console.log(999999999999999)
}
if(templateKind.value === "PROGRESS" && !editable.value ){
  //console.log(999999999999999)
}

const uuid = ref("")
if(columnProps.value.dataItem !== undefined){
  ////uuid.value = columnProps.value.dataItem["id"]
  uuid.value = columnProps.value.dataItem["uuid"]
}

// ##### Component Life-Cycle  #######
onBeforeMount(() => {

})

const selectCheck = ref(null)
onMounted(() => {

})

onUpdated(() => {

})

// ##### watach && watchEffect #######
const itemValue4Old:any = ref(itemValue.value)
// watch(itemValue, (newValue:any, oldValue:any) => { // t te tex text
//   console.log("ttttttttttttttttt", newValue, oldValue)
//   itemValue4Old.value = oldValue
// },{ deep: true })
watch(itemValue, () => {
  columnProps.value.dataItem[columnProps.value.field] = itemValue.value
  emit('update:columnProps', itemValue.value)
  emit('update:dataItem', columnProps.value.dataItem)  
}, { deep: true })


watchEffect(() => {
  if(props.componentKey !== componentKey.value){ // not working ?? 
    componentKey.value ++ 
  }

  if(props.allSelected4Check !== allSelected4Check.value){ // 전체 선택시... 
    console.log("전체선택 50 : watchEffect ######", allSelected.value, selectedRows.value?.length)

    allSelected4Check.value = props.allSelected4Check
    componentKey4AllCheck.value ++ 
    //componentKey4SelectRow.value ++
  }

  if(props.selectComponentKey !== selectComponentKey.value){ // 그리드 행선택(single)
    if(templateKind.value.toUpperCase() === "ROWCHECK" && !isMultiSelect4Check.value ){ // 행 선택시... 
      selectedRows.value = props.selectedRows // important !!!
      //console.log("행선택 50 : watchEffect ######", selectedRows.value, selectedRows.value?.length)
      selectComponentKey.value ++
    }  
  }

})

// ##### function && event #####
const onClickLink = (e:any, item:any, field:string) => {  
  console.log("VCustomLink template ==> 0000", field, columnProps.value.dataItem)
  emit('clickLink', e, columnProps.value.dataItem, field)
}

const onRowCheckClick = (e:any, item:any, uuid:string) => {  
  console.log("행선택 10 : onRowCheckClick ######", selectedRows.value?.length, isMultiSelect4Check.value)

  emit('checkRow', e, item, uuid)
}

const allSelected = ref(false)
const onAllRowCheckClick = (e:any) => {  
  allSelected.value = !allSelected.value

  console.log("전체선택 10 : onAllRowCheckClick ######", allSelected.value, selectedRows.value?.length)

  if(allSelected.value){
    // dummy
  }else{
    selectedRows.value = []
  }

  emit('checkAllRow', e, selectedRows.value === undefined ? [] : selectedRows.value, allSelected.value)
  emit('update:selectedRows', selectedRows.value)
}

const onClickKCombo = (e:any, item:any, field:string) => {  
  console.log("VCustomLink template ==> onClickKCombo", columnProps.value.dataItem)
}

const selectChange4KCombo = (selectItemObject:any) => {  
  console.log("selectChange4KCombo...###### %%%%%", selectItemObject, rowIndex.value)
  
  componentKey.value ++ 
  setTimeout(function() {
    emit('selectChange4KCombo', selectItemObject, rowIndex.value)
  }, 1)
}

// defineExpose를 통하여 함수를 내보낸다.
// defineExpose({
//   toggleAllCheck,
// });

const commaNum = (value:number) => {
  return VTemplateUtils.commaNum(value, format.value)
  // value = PageUtils.isNull4Num(value, 0)
  // let numVal = (value === undefined ? 0 : value) //1000000.123;
  // //console.log("commaNum....", price)
  // if(format.value === NUMBER_FORMAT.RATE_PERCENT){ 
  //   return numVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + "%"
  // }else if(format.value === NUMBER_FORMAT.BUDGET_SHORT_AMT){
  //   numVal = MathUtils.toFixed4BudgetAmt(numVal, 100) // 억단위, 소수이하 백만단위까지 표시 
  //   return numVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  // }else if(format.value !== ""){  // format
  //   let result = numVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  //   const resultArr = result.split(".")
  //   if(resultArr.length >= 2){
  //     let decimalPoint = resultArr[1]

  //     if(format.value === NUMBER_FORMAT.DECIMAL_POINT_0){
  //       result = resultArr[0]
  //     }else{
  //       if(format.value === NUMBER_FORMAT.DECIMAL_POINT_1) decimalPoint = StringUtils.rpad(decimalPoint, 1, "0")
  //       if(format.value === NUMBER_FORMAT.DECIMAL_POINT_2) decimalPoint = StringUtils.rpad(decimalPoint, 2, "0")
  //       if(format.value === NUMBER_FORMAT.DECIMAL_POINT_3) decimalPoint = StringUtils.rpad(decimalPoint, 3, "0")
  //       result = resultArr[0] + "." + decimalPoint
  //     }
  //   }
  //   return result
  // }else{
  //   let result = numVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  //   return result
  // }
}

const onOpen = (e?:any) => {
  //console.log(9999999)
}

const onValueChanged = function(e:any, itemObject:any, field:string) {
  console.log("onValueChanged.....VCustomKTemplate",  e, itemObject, field, itemValue4Old.value)
  emit("onValueChanged", e, itemObject, field, itemValue4Old.value)

  itemValue4Old.value = itemValue.value // 다음번 old값 저장
}


</script>

<!-- kendo grid column template : number -->
<template>
  
    <!-- :model-value="selectedRows === undefined || selectedRows.length === 0 ? false : selectedRows.includes(`${uuid}`)"   -->
    <!-- 행선택용 체크 -->
    <td v-if="templateKind==='ROWCHECK'" :class="(' custom-template _chk text-center ') + (locked ? ' k-table-td k-grid-content-sticky ' : '') "
        :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
    > 
      <VCheckbox v-if="isMultiSelect4Check"
        :id="uuid"
        :model-value="selectedRows === undefined || selectedRows.length === 0 || !allSelected4Check ? false : selectedRows.includes(uuid)"
        @click="onRowCheckClick($event, columnProps.dataItem, uuid)"
        :key="componentKey"
      /> 
      
      <VCheckbox  v-if="!isMultiSelect4Check"
        :id="uuid"
        :model-value="selectedRows === undefined || selectedRows.length === 0 ? false : selectedRows.includes(uuid)"
        @click="onRowCheckClick($event, columnProps.dataItem, uuid)"
        :key="selectComponentKey"
      /> 

    </td>

    <!-- 전체 행선택용 체크 -->
    <td v-if="templateKind==='ALLROWCHECK'" :class="(className==='' ? ' custom-template _chkAll text-center  ' : className + ' custom-template _chkAll text-center ') +  (locked ? 'k-table-td k-grid-content-sticky' : '') "
      :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
    >
      <VCheckbox 
        id="all"
        v-model="allSelected"
        @click="onAllRowCheckClick($event)"
        :key="componentKey4AllCheck"
      /> 
    </td>
    

    <!-- 일반 체크 박스 -->
    <td v-if="templateKind==='CHECK'" :class="(className==='' ? ' custom-template ' : className + ' custom-template ') +  (locked ? 'k-table-td k-grid-content-sticky' : '') "
      :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
    >
      <VCheckbox 
        v-model="itemValue"
        :key="componentKey"
      />
    </td>

    <!-- https://vue-treeselect.js.org/ -->
    <td v-if="templateKind==='TREESELECT'" :class="(className==='' ? 'text-center custom-template ' : className + ' custom-template ') +  (locked ? 'k-table-td k-grid-content-sticky' : '') "
      :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
      :title="itemValue"
    >

      <span v-if="!editable" 
        class="text-start"
        :key="componentKey"
      >
        {{itemValue}}
      </span>

      <VueTreeSelect  v-if="editable" 
        v-model="itemValue"
        :options="storeTreeCodeItems[columDetailProps._codeGroup]"
        :multiple="multiple"
        :disable-branch-nodes="true"
        search-nested
        :show-count="true"
        :always-open="false"
        :appendToBody="false"
        openDirection="auto"
        @open="onOpen"
        :key="componentKey"
      />
    </td>

    <td v-if="templateKind==='SELECT'" :class="(className==='' ? ' text-center custom-template ' : className + ' custom-template ') +  (locked ? 'k-table-td k-grid-content-sticky' : '') "
      :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
      :title="itemValueText"
    >
      <span v-if="!editable" 
        class=""
        :key="componentKey"
      >
        {{itemValueText}}
      </span>

      <VSelect v-if="editable"
        v-model="itemValue"
        :items="codeItems"
        :readonly="readonly"
        :key="componentKey"
      />
    </td>

    <td v-if="templateKind==='COMBO'" :class="(className==='' ? ' text-center custom-template ' : className + ' custom-template ') +  (locked ? 'k-table-td k-grid-content-sticky' : '') "
      :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
      :title="itemValueText"
    >
      <span v-if="!editable" 
        class=""
        :key="componentKey"
      >
        {{itemValueText}}
      </span>

      <VCombobox v-if="editable"
        v-model="itemValue"
        :items="codeItems"
        :readonly="readonly"
        :key="componentKey"
      />
    </td>

    <td v-if="templateKind==='KMULTICOMBO'" :class="(className==='' ? ' text-center custom-template ' : className + ' custom-template ') +  (locked ? 'k-table-td k-grid-content-sticky' : '') "
      :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
      :title="itemValueText"
    >
      <span v-if="!editable" 
        class=""
        :key="componentKey"
      >
        {{itemValueText}}
      </span>

      <VCustomMultiCombo  v-if="editable"
        v-model:selectItem="itemValue"
        v-model:dataItems="codeItems" 
        :multiple="true"
        :isShowSlot="false"
        :readonly="readonly"
        :componentKey="componentKey"
        :key="componentKey"
      ></VCustomMultiCombo> 
    </td>

    <td v-if="templateKind==='KCOMBO'" :class="(className==='' ? ' text-center custom-template ' : className + ' custom-template ') +  (locked ? 'k-table-td k-grid-content-sticky' : '') "
      :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
      :title="itemValueText"
    >
      <span v-if="!editable" 
        class=""
        :key="componentKey"
      >
        {{itemValueText}}
      </span>

      <VCustomMultiCombo  v-if="editable"
        v-model:selectItem="itemValue"
        v-model:dataItems="codeItems" 
        :multiple="false"
        :isShowSlot="false"
        @selectChange4KCombo="selectChange4KCombo"
        @click="onClickKCombo($event, columnProps.dataItem, field)"
        v-model:rowIndex="rowIndex" 
        :chips="false"
        :readonly="readonly"
        :componentKey="componentKey"
        :key="componentKey"
      ></VCustomMultiCombo> 
    </td>

 
    <td v-if="templateKind==='LINK'" :class="(className==='' ? ' custom-template ' : className + ' custom-template ') +  (locked ? 'k-table-td k-grid-content-sticky' : 'k-table-td') "
        :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
        :title="isLink4Code ? itemValueText : itemValue"
    >
      <RouterLink :to="{}">
        <span @click="onClickLink($event, columnProps.dataItem, field)" class="text-primary " 
          :key="componentKey"
        >
          {{isLink4Code ? itemValueText : itemValue}}
        </span>
      </RouterLink>
    </td>

    <td v-if="templateKind==='NUMBER'" :class="(className==='' ? 'text-end custom-template ' : className + ' custom-template ') +  (locked ? 'k-table-td k-grid-content-sticky' : '') "
      :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '')  "
    >
      <span v-if="!editable" 
        :key="componentKey"
      >
        {{ commaNum(itemValue) }}
      </span>

      <VTextField v-if="editable"
        v-model="itemValue"
        type="number"
        :max="number_max"
        :min="number_min"
        step="1"
        class="custm-number"
        :key="componentKey"
        @change="onValueChanged($event, columnProps.dataItem, field)"
      />
      
    </td>

    <td v-if="templateKind==='TEXT'" :class="(className === '' && !isText4Code ? 'text-start custom-template ' : className === '' && isText4Code ? 'text-center custom-template ' : className + ' custom-template ') 
        +  (locked ? 'k-table-td k-grid-content-sticky' : '') "
      :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
      :title="isText4Code ? itemValueText : itemValue"
    >
      <span v-if="!editable" 
       :key="componentKey"
      >
        {{isText4Code ? itemValueText : itemValue}}
      </span>

      <VTextField v-if="editable"
        class="text-start custom-template"
        v-model="itemValue"
        :key="componentKey"
        @change="onValueChanged($event, columnProps.dataItem, field)"
      /> 
    </td>

    <td v-if="templateKind==='TEXTAREA'" :class="(className === '' && !isText4Code ? 'text-start custom-template ' : className === '' && isText4Code ? 'text-center custom-template ' : className + ' custom-template ') 
        +  (locked ? 'k-table-td k-grid-content-sticky' : '') "
      :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
      :title="isText4Code ? itemValueText : itemValue"
    >
      <div v-if="!editable" 
       :key="componentKey"
       style="white-space:pre-wrap;"
      >
        {{isText4Code ? itemValueText : itemValue}}
      </div>

      <VTextarea v-if="editable"
        class="text-start custom-template"
        v-model="itemValue"
        :key="componentKey"
        @change="onValueChanged($event, columnProps.dataItem, field)"
      /> 
    </td>

    <!-- Icon -->
    <td v-if="templateKind==='ICON'" :class="(className==='' ? ' text-center custom-template ' : className + ' text-center  custom-template ') +  (locked ? 'k-table-td k-grid-content-sticky' : '') "
     :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
    >
      <!-- <VAvatar v-if="itemValue==='late'"
        size="22"
        rounded
        class="elevation-2 me-4"
        style="background-color: #fff;"
        :key="componentKey"
      >
        <VIcon
          style="color: tomato;"
          icon="mdi-alarm-light-outline"
          size="24"
          :key="componentKey"
        />
      </VAvatar> -->

      <VAvatar v-if="iconType.visible"
        size="22"
        rounded
        class="elevation-2 me-4"
        style="background-color: #fff;"
        :key="componentKey"
        :title="iconType.title === undefined ? '' : iconType.title"
      >  
        <RouterLink :to="{}" v-if="iconType.isLink">
          <VIcon
            :icon="iconType.icon"
            size="24"
            :key="componentKey"
            :class="iconType.class"
            @click="onClickLink($event, columnProps.dataItem, field)"  
          />
        </RouterLink>

        <VIcon v-if="iconType.isLink === undefined || !iconType.isLink"
          :icon="iconType.icon"
          size="24"
          :key="componentKey"
          :class="iconType.class"
          @click="onClickLink($event, columnProps.dataItem, field)"  
        />

      </VAvatar>
      
    </td>

    <!-- Progress -->
    <td v-if="templateKind==='PROGRESS'" :class="(className==='' ? ' text-center custom-template ' : className + ' text-center  custom-template ') +  (locked ? 'k-table-td k-grid-content-sticky' : '') "
     :style="(locked ? 'left: ' + lockedLeft[lockedColumn[field]] + 'px; right: ' + lockedRight[lockedColumn[field]] + 'px;' : '') "
    >
      <VProgressLinear
        v-model="itemValue"
        :color="iconType.color"
        height="20"
        :title="Math.floor(10*itemValue)/10 + '%'"
      >
        <template #default="{ value }">
          <strong>{{ Math.floor(10*value)/10 }}%</strong>
        </template>
      </VProgressLinear>
    </td>

</template>

<style scoped> 
/* important scoped  */
.k-grid-td-defence { /** kendo grid 안에 있을 경우  **/
  overflow: inherit;
}

.k-table-row.k-table-group-row.k-grouping-row td { /** 그룹핑 헤더부분에 템플릿 컬럼 제거  */
  display: none;
}

.content-sticky {
  position: sticky !important;
  z-index: 4 !important;
}
</style>

<!-- 뭔차이 ?? -->
<style scope>   
/* important scope  */
.k-grid .v-field__input.custm-number {
  min-block-size: 1px;
  text-align: end;
}

.k-grid .v-field__input {
  max-block-size: 30px !important;

  /* min-height: var(--v-input-control-height, 36px) !important; */
  min-block-size: 1px;
}

.k-grid th,
.k-grid td {
  overflow: hidden;
  border-style: solid;
  border-color: inherit;
  font-weight: inherit;
  outline: 0;
  padding-block: 8px;
  padding-inline: 12px;
  text-align: inherit;
  text-overflow: ellipsis;
}

/* grid multi-line */
.breakWord20 {
  word-break: break-all !important;
  word-wrap: break-word !important;
  vertical-align: top;
}

</style>

