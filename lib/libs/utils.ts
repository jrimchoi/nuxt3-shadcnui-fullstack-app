import { CHILD_WIDTH, DASHBOARD_COLOR, ISO_DATE, SVID, TEXT_FORMAT } from '@/gs-caltex/core/libs/constants'
import { useCodeStore } from '@/gs-caltex/core/store/useCommStore'
import { v4 as uuidv4 } from 'uuid'
import { useTheme } from 'vuetify'
import { ADAPTOR_TYPE } from '../classes/adaptor'

export const ProjectAdaptor = {
  multiCodeFileds: ['gscProjectSite',
    'businessUnitProject',
    'gscFundingType',
    'gscCostCenter'],
  dateFieldProps: { // 저장할때.. 아래포맷으로 변경해서 넘겨준다.
    constraintDate: ISO_DATE.ISO_DASH,
    estimatedStartDate: ISO_DATE.ISO_ENOVIA,
    estimatedFinishDate: ISO_DATE.ISO_ENOVIA,
  },
}
export const RndContributionAdaptor = {
  multiCodeFileds: ['gscContributionType',
    'businessUnitId',
    'projectId',
    'gscContributionUnit'],
  dateFieldProps: { // 저장할때.. 아래포맷으로 변경해서 넘겨준다.
    originated: ISO_DATE.ISO_ENOVIA,
  },
}
export const ProjectResourceAdaptor = {
  multiCodeFileds: ['projectId',
    'businessUnitId'],
  dateFieldProps: { // 저장할때.. 아래포맷으로 변경해서 넘겨준다.
    originated: ISO_DATE.ISO_ENOVIA,
  },
}
export const LoginUserData = {
  // HJ 230508 username & role add
  userData: { deptcode: '', deptId: '', deptname: '', id: '', username: '', role: '' },
  setUserData(user: any) {
    // console.log("aaaaaaaaaaa", user)
    this.userData = user // UserProperties
  },
  getUserData() {
    // console.log("bbbbb", this.userData)
    return this.userData
  },
}

export const LoginUser = { // 로그인 사용자 정보
  userData: LoginUserData.getUserData(),
  userId: LoginUserData.getUserData() === null ? '' : LoginUserData.getUserData().id,
  deptcode: LoginUserData.getUserData() === null ? '' : LoginUserData.getUserData().deptcode,
  deptId: LoginUserData.getUserData() === null ? '' : LoginUserData.getUserData().deptId,
  deptname: LoginUserData.getUserData() === null ? '' : LoginUserData.getUserData().deptname,

  // HJ 230508 username & role add
  username: LoginUserData.getUserData() === null ? '' : LoginUserData.getUserData().username,
  role: LoginUserData.getUserData() === null ? '' : LoginUserData.getUserData().role,

  setLoginUser() {
    // console.log("cxxxxxxxxxxxx", LoginUserData.getUserData())
    this.userData = LoginUserData.getUserData()
    this.userId = LoginUserData.getUserData().id
    this.deptcode = LoginUserData.getUserData().deptcode
    this.deptId = LoginUserData.getUserData().deptId
    this.deptname = LoginUserData.getUserData().deptname

    this.username = LoginUserData.getUserData().username
    this.role = LoginUserData.getUserData().role
  },
}

export const DateUtils = {
  getDate4Display(dateStr?: any, type?: string) {
    // 화면표시용 날짜 가져오기
    // console.log("hhhhhhhh", dateStr, type)
    if (dateStr === undefined || dateStr === null || dateStr === '') {
      return ''
    }
    else {
      // console.log("getDate4Display dateStr", dateStr)

      let date1: any = null
      if (type === TEXT_FORMAT.DIGIT_DATE) {
        try {
          if (isNaN(dateStr)) {
            console.log('날짜 포맷 안맞음....1')

            return ''
          }
          date1 = new Date(
            Math.round((Number(dateStr) - 25569) * 86400 * 1000),
          )
        }
        catch (error) {
          console.log('날짜 포맷 안맞음....2')

          return ''
        }
      }
      else {
        if (dateStr.length === 8) { // 20201231 문자로 데이터가 넘어올경우
          // 날짜변환을 위해 20201231 --> 2020.12.31 로 변경
          dateStr = `${dateStr.substr(0, 4)}.${dateStr.substr(4, 2)}.${dateStr.substr(6, 2)}`
        }

        try {
          date1 = new Date(dateStr)
        }
        catch (error) {
          console.log('날짜 포맷 안맞음....3')

          return dateStr
        }
      }

      let ymd = new Intl.DateTimeFormat('kr').format(date1)

      const TIME_ZONE = 3240 * 10000
      const ymd2 = new Date(+date1 + TIME_ZONE).toISOString().split('T')[0]
      const ymd3 = new Date(+date1 + TIME_ZONE).toISOString().split('.')[0]

      // console.log("tttttttt", ymd, ymd2, ymd3)

      /**
      const TIME_ZONE = 3240 * 10000;
      const d = new Date('2021-08-05 09:51:31');  DateUtils.getDate4Display("aaa", "yyyy-MM-ddT")

      const date = new Date(+d + TIME_ZONE).toISOString().split('T')[0];
      const time = d.toTimeString().split(' ')[0];

      console.log(date + ' ' + time);
      **/
      if (type === TEXT_FORMAT.DIGIT_DATE) { // 37175
        if (localStorage.getItem('mylang') === 'ko')
          ymd = new Intl.DateTimeFormat('kr').format(date1)
        else
          ymd = new Intl.DateTimeFormat('en-US').format(date1)

        if (localStorage.getItem('mylang') === 'ko') {
          const temp = DateUtils.getDateFormed(ymd)

          return `${temp.yyyy}.${temp.mm}.${temp.dd}`
        }
        else {
          return ymd
        }

        // return ymd.replaceAll(" ", "0").substring(0, 10); // 2023.01.01
      }
      else if (type === TEXT_FORMAT.MDY_SLASH) {
        // let temp = ymd.replaceAll(" ", "0").split(".")  // 2023.01.01
        // return temp[1] + "/" + temp[2] + "/" + temp[0]  //  01/31/2023

        const temp = DateUtils.getDateFormed(ymd)

        return `${temp.mm}/${temp.dd}/${temp.yyyy}`
      }
      else if (type === TEXT_FORMAT.YMD_DOT) {
        const temp = DateUtils.getDateFormed(ymd)

        // const return_ymd = ymd.replaceAll(" ", "0");
        return `${temp.yyyy}.${temp.mm}.${temp.dd}`

        // if (ymd.length == 11) {
        //   return return_ymd.substring(0, 10); // 2023.01.01
        // } else if (ymd.length == 12) {
        //   return return_ymd.substring(0, 8) + return_ymd.substring(9, 11); // 2023.02.22
        // } else if (ymd.length == 13) {
        //   return (
        //     return_ymd.substring(0, 5) +
        //     return_ymd.substring(6, 9) +
        //     return_ymd.substring(10, 12)
        //   ); // 2023.10.22
        // } else {
        //   let temp = DateUtils.getDateFormed(ymd)
        //   return temp.yyyy + "." + temp.mm + "." + temp.dd
        //   //return ymd.replaceAll(" ", "0").substring(0, 10); // 2023.01.01
        // }
      }
      else if (type === TEXT_FORMAT.YMD_DASH_T) {
        return ymd3 // 2023-01-04T11:24:25
      }
      else if (type === TEXT_FORMAT.YMDHM_DASH) {
        return ymd3.replaceAll('T', ' ').substring(0, 16)
      }
      else if (type === TEXT_FORMAT.YMDHMS_DASH) {
        return ymd3.replaceAll('T', ' ').substring(0, 19)
      }
      else if (type === TEXT_FORMAT.YMD_DASH) {
        return ymd3.replaceAll('T', '').substring(0, 10)
      }
      else { return 'not defined...' }
    }
  },

  getDateFormed(ymd: string) { // 1996. 11. 8.  --> 1996.11.08.
    const temp = ymd.replaceAll(' ', '').split('.')
    const yyyy = (temp.length > 0 && temp[0].length === 4) ? temp[0] : ''
    let mm = ''; let dd = ''
    if (temp.length > 1 && temp[1].length === 1)
      mm = `0${temp[1]}`

    else if (temp.length > 1 && temp[1].length === 2)
      mm = temp[1]

    if (temp.length > 2 && temp[2].length === 1)
      dd = `0${temp[2]}`

    else if (temp.length > 2 && temp[2].length === 2)
      dd = temp[2]

    return { yyyy, mm, dd }
  },

  getDate() {
    // 오늘날짜
    const date1 = new Date()

    // let ymd = new Intl.DateTimeFormat("kr").format(date1);

    // // ymd.substring(0, 10) == 2023. 4. 5
    // console.log(ymd.split(".")[0], ymd.split(".")[1], ymd.split(".")[2])
    // let year = ymd.split(".")[0]
    // let month = (ymd.split(".")[1].trim().length === 1 ? "0" : "") + ymd.split(".")[1].trim()
    // let day = (ymd.split(".")[2].trim().length === 1 ? "0" : "") + ymd.split(".")[2].trim()
    // ymd = year + "." + month + "." + day
    // console.log("ymd...", ymd, ymd.replaceAll(".", "-") )

    // return ymd.replaceAll(".", "-"); // 2023-01-01
    return new Date(date1.getTime() - (date1.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0]
  },

  addDays(baseDate: string, offset: number) {
    const result = new Date(baseDate)

    result.setDate(result.getDate() + offset)

    return result.toISOString().slice(0, 10)
  },

  addMonths(baseDate: string, offset: number) {
    const result = new Date(baseDate)

    result.setMonth(result.getMonth() + offset)

    return result.toISOString().slice(0, 10)
  },

  checkValidDate(value: string) {
    // 2023-01-01
    let result = true
    try {
      const date = value.split('-')
      const y = parseInt(date[0], 10)
      const m = parseInt(date[1], 10)
      const d = parseInt(date[2], 10)

      const dateRegex
        = /^(?=\d)(?:(?:31(?!.(?:0?[2469]|11))|(?:30|29)(?!.0?2)|29(?=.0?2.(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(?:\x20|$))|(?:2[0-8]|1\d|0?[1-9]))([-.\/])(?:1[012]|0?[1-9])\1(?:1[6-9]|[2-9]\d)?\d\d(?:(?=\x20\d)\x20|$))?(((0?[1-9]|1[012])(:[0-5]\d){0,2}(\x20[AP]M))|([01]\d|2[0-3])(:[0-5]\d){1,2})?$/

      result = dateRegex.test(`${d}-${m}-${y}`)
    }
    catch (err) {
      result = false
    }

    return result
  },
}

export const DataUtils = {
  sort(items: any, fields: any) {
    let sortCond = []
    if (typeof (fields) === 'string') { // dataelements.originated 안됨... 단순필드만 가능..고도화 할것.
      sortCond.push(fields)
    }
    else {
      sortCond = fields
    }

    const fieldSorter = (sortCond: any) => (a: any, b: any) => sortCond.map((o: any) => {
      let dir = 1
      if (o[0] === '-') { dir = -1; o = o.substring(1) }

      return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0
    }).reduce((p: any, n: any) => p || n, 0)

    // return items.sort(fieldSorter(['state', '-price']))
    return items.sort(fieldSorter(sortCond))
  },
}

export const StringUtils = {
  lpad(str: string, padLen: number, padStr: string) {
    if (padStr.length > padLen) {
      console.log('오류 : 채우고자 하는 문자열이 요청 길이보다 큽니다')

      return str
    }
    str += '' // 문자로
    padStr += '' // 문자로
    while (str.length < padLen)
      str = padStr + str

    str = str.length >= padLen ? str.substring(0, padLen) : str

    return str
  },

  rpad(str: string, padLen: number, padStr: string) {
    if (padStr.length > padLen) {
      console.log('오류 : 채우고자 하는 문자열이 요청 길이보다 큽니다')

      return `${str}`
    }
    str += '' // 문자로
    padStr += '' // 문자로
    while (str.length < padLen)
      str += padStr

    str = str.length >= padLen ? str.substring(0, padLen) : str

    return str
  },

  space4Special(count: number) {
    let str = ''
    while (str.length < count)
      str += 'ㅤ'

    return str
  },
}

export const MathUtils = {
  getMax(arr: any, prop: string) {
    let max
    for (let i = 0; i < arr.length; i++) {
      if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
        max = arr[i]
    }

    return max
  },

  toFixedBudgetRate(num1: number, num2: number, floorDigit?: number) {
    floorDigit = floorDigit === undefined ? 10 : floorDigit

    if (num2 === 0)
      return 0

    return Math.floor(floorDigit * 100 * num1 / num2) / floorDigit
  },

  toFixed4BudgetAmt(num: number, floorDigit?: number) {
    floorDigit = floorDigit === undefined ? 10 : floorDigit

    // 억원, 백만단위에서 절사
    return Math.floor(floorDigit * num / 100000000) / floorDigit
  },

  floor4Million(num: number, zeroCompare?: boolean) {
    zeroCompare = zeroCompare === undefined ? true : zeroCompare
    let value = Math.floor(num / 1000000)

    if (num !== 0 && value === 0 && zeroCompare)
      value = num / 1000000

    return value
  },

  floor(num: number, zeroCompare?: boolean) {
    zeroCompare = zeroCompare === undefined ? true : zeroCompare
    let value = Math.floor(num)

    if (num !== 0 && value === 0 && zeroCompare)
      value = num

    return value
  },

  floor4Res(num: number, zeroCompare?: boolean) {
    zeroCompare = zeroCompare === undefined ? true : zeroCompare
    let value = Math.floor(1000 * num) / 1000 // 소수 3자리

    if (num !== 0 && value === 0 && zeroCompare)
      value = num

    return value
  },

  toFixedRes(num: any) {
    if (typeof (num) === 'string')
      num = parseFloat(num)

    num = PageUtils.isNull4Num(num, 0)

    if (num === 0) {
      return 0
    }
    else {
      const strArr = String(num).split('.')
      if (strArr.length > 1) {
        if (strArr[1].length === 1)
          return num

        else if (strArr[1].length === 2)
          return num

        else if (strArr[1].length >= 3)
          return parseFloat(num.toFixed(3))

        else
          return num
      }
    }

    return num
  },

  toFixedAmt(num: any) {
    if (typeof (num) === 'string')
      num = parseFloat(num)

    num = PageUtils.isNull4Num(num, 0)

    if (num === 0) {
      return 0
    }
    else {
      const strArr = String(num).split('.')
      if (strArr.length > 1) {
        if (strArr[1].length === 1)
          return num

        else if (strArr[1].length === 2)
          return num

        else if (strArr[1].length >= 3)
          return parseFloat(num.toFixed(3))

        else
          return num
      }
    }

    return num
  },

  num4Digit: (n2: any) => { // 3자리컴마
    return n2.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
  },

}

export const PageUtils = {
  dummy() { return 'dummy' },

  uuid() {
    return uuidv4()
  },

  rgba2hex(orig: any) {
    let a; let isPercent
    const rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i)
    const alpha = (rgb && rgb[4] || '').trim()
    let hex = rgb
      ? (rgb[1] | 1 << 8).toString(16).slice(1)
    + (rgb[2] | 1 << 8).toString(16).slice(1)
    + (rgb[3] | 1 << 8).toString(16).slice(1)
      : orig

    if (alpha !== '')
      a = alpha
    else a = 0o1
    hex = hex + a

    return hex
  },

  distinctRecords(MYJSON: any, prop: any) {
    return MYJSON.filter((obj: any, pos: any, arr: any) => {
      return arr.map((mapObj: any) => mapObj[prop]).indexOf(obj[prop]) === pos
    })
  },

  sort(jsonArray: any, field: string) {
    return jsonArray.sort((a: any, b: any) => {
      if (a[field] > b[field])
        return 1
      if (a[field] < b[field])
        return -1
      if (a[field] === b[field])
        return 0
    })
  },

  json2FlatField(json: any, field: string) {
    // let json = JSON.parse(data.data[i].dataelements["gscBudgetAmount"])
    const keys = Object.keys(json)
    const dataItem: any = {}
    for (let k = 0; k < keys.length; k++) {
      const key = keys[k]

      dataItem[`${field}_${key}`] = json[key]
    }

    return dataItem
  },

  changeLang(lang: string) {
    localStorage.setItem('mylang', lang)
    window.location.reload()

    // codeStore.setCodeStorage()
    // useRouter().push({path:'/',})
  },

  alert(messageId: string, substitute?: string) {
    alert(useCodeStore().Dic(messageId, substitute)) // MSG.chkOne
  },

  confirm(messageId: string, substitute?: string, postStr?: string) {
    postStr = postStr === undefined ? '' : ` [${postStr}]`

    const msg = useCodeStore().Dic(messageId, substitute) + postStr

    return confirm(msg) // MSG.chkOne
  },

  viewMode(data: any) {
    if (this.rowType(data) === 'I')
      return 'I'
    else if (
      data.dataelements
      && PageUtils.hasAuth('SAVE', data, 'modifyAccess')
    )
      return 'U'
    else if (
      data.dataelements
      && !PageUtils.hasAuth('SAVE', data, 'modifyAccess')
    )
      return 'V' // 읽기전용
    else if (
      data.dataelements
      && PageUtils.hasAuth('SAVE', data, 'deleteAccess')
    )
      return 'D'
    else
      return 'V' // 읽기전용
  },

  rowType(data: any) {
    if (data.id === '')
      return 'I'
    else if (data.dataelements === undefined && data.id !== '')
      return 'U'
    else if (data.dataelements)
      return 'U'

    return 'X'
  },

  hasAuth(auth: string, data: any, access: string) {
    // data >> data.dataelements >> data.dataelements.modifyAccess
    auth = auth.toUpperCase()

    // console.log("xxxxxxxxxx", auth, data, access)
    if (this.rowType(data) === 'U') {
      if (data.dataelements === undefined) {
        if (auth === 'SAVE' && data[access] === 'TRUE')
          return true

        if (auth === 'DEL' && data[access] === 'TRUE')
          return true
      }
      else {
        if (auth === 'SAVE' && data.dataelements[access] === 'TRUE')
          return true

        if (auth === 'DEL' && data.dataelements[access] === 'TRUE')
          return true
      }
    }
    else if (this.rowType(data) === 'I') {
      // console.log("aaaaaaaaaaa", auth, data, access)

      if (auth === 'SAVE')
        return true
      else if (auth === 'SAVEAS')
        return false
      else if (auth === 'DEL')
        return false
    }

    return false
  },

  requiredLabel: (title: string, isRequire?: boolean) => {
    if (isRequire === undefined || isRequire)
      return `*${title}`

    else
      return title
  },

  readonly4Key: (compareValue: string) => {
    // 해당 키값이 존재하면 readonly
    if (
      !(
        compareValue === ''
        || compareValue === null
        || compareValue === undefined
      )
    )
      return true

    else
      return false
  },

  readonly4ViewMode: (viewMode: string) => {
    // viewMode === 'V' 인 경우 읽기전용
    if (viewMode === 'V')
      return true

    else
      return false
  },

  code4VComboMultiple: (codeId: string, value: any) => {
    // string --> []
    const codeStore = useCodeStore()

    // console.log("code4VComboMultiple data.....", typeof(value), value)

    if (typeof value === 'string' && value === '') {
      return null
    }
    else if (typeof value === 'string') {
      const list = []
      const arr = value.split(',')
      for (let i = 0; i < arr.length; i++) {
        list.push({
          value: arr[i],
          title: codeStore.getCodeTitle(codeId, value),
        })
      }

      // console.log("aaaaaa", list)
      return list
    }
    else {
      return value
    }
  },

  code4VSelectMultiple: (item: any, multiCodeFileds?: string[]) => {
    // string --> []

    if (
      multiCodeFileds === undefined
      || multiCodeFileds === null
      || multiCodeFileds.length === 0
    ) {
      // dummy
    }
    else {
      for (let i = 0; i < multiCodeFileds.length; i++) {
        if (typeof item === 'object') {
          let codeStr = item[multiCodeFileds[i]] === undefined ? '' : item[multiCodeFileds[i]]

          if (codeStr === undefined || codeStr === null) {
            item[multiCodeFileds[i]] = null

            // console.log("############## 00000", multiCodeFileds[i], codeStr, typeof(item), item )
          }
          else if (codeStr === '') {
            item[multiCodeFileds[i]] = null

            // console.log("############## 11111", multiCodeFileds[i], codeStr, typeof(item), item )
          }
          else {
            codeStr = codeStr.replaceAll('', ',')
            codeStr = codeStr.replaceAll(', ', ',')
            codeStr = codeStr.replaceAll(' ,', ',')
            item[multiCodeFileds[i]] = codeStr.split(',')

            // console.log("##############", multiCodeFileds[i], codeStr, typeof(item), item )
          }
        }
        else {
          /// return item
        }
      }
    }
  },

  multiCode2Data: (data: any, fieldNm: string) => {
    // 멀티코드값 --> 문자열(,)로 변경
    const tmpl: any = data[fieldNm]
    let str = ''
    let cnt = 0

    // console.log("tmpl", fieldNm, tmpl)

    if (tmpl === undefined)
      return ''

    for (let i = 0; i < tmpl.length; i++) {
      if (cnt === 0) {
        str += tmpl[i]
      }
      else {
        // str += "," + tmpl[i]
        str += `${tmpl[i]}`
      }
      cnt++
    }

    return str
  },

  cloneObject4TR: (object: any, multiCodeFileds?: string[]) => {
    // transaction 처리용 (데이터복제 및 멀티코드값 변경)
    const clone = { ...object }

    if (clone.dataelements === undefined) {
      if (
        multiCodeFileds === undefined
        || multiCodeFileds === null
        || multiCodeFileds.length === 0
      ) {
      }
      else {
        for (let i = 0; i < multiCodeFileds.length; i++) {
          clone[multiCodeFileds[i]] = PageUtils.multiCode2Data(
            clone,
            multiCodeFileds[i],
          )
        }
      }
    }
    else {
      clone.dataelements = { ...object.dataelements }

      if (
        multiCodeFileds === undefined
        || multiCodeFileds === null
        || multiCodeFileds.length === 0
      ) {
      }
      else {
        for (let i = 0; i < multiCodeFileds.length; i++) {
          clone.dataelements[multiCodeFileds[i]] = PageUtils.multiCode2Data(
            clone,
            multiCodeFileds[i],
          )
        }
      }
    }

    return clone
  },

  cloneObject: (object: any) => {
    // object, object2 비교용
    // console.log("cloneObject", object)
    // if (isProxy(object)){
    //   return JSON.parse(JSON.stringify(object));
    //   return structuredClone(toRaw(object))
    // }else{
    //   // Array.isArray(dataItem.value)
    //   return structuredClone(toRaw(object))
    // }
    // console.log("object", object);
    if (object === undefined)
      return null

    else
      return JSON.parse(JSON.stringify(object)) // structuredClone(toRaw(object))
  },

  isChange: (object: any, originObject: any, compareKey?: any) => {
    // 데이터 변경여부
    let chgCnt = 0

    // compareKey : row data key !== 'id'
    if (compareKey === undefined)
      compareKey = 'id'

    console.log('object.........', object)
    console.log('originObject...', originObject)

    if (Array.isArray(object) || Array.isArray(originObject)) {
      const changedRows = []
      for (let i = 0; i < object.length; i++) {
        const id = object[i][compareKey]

        if (object[i]._rowType === 'I') {
          chgCnt++
          changedRows.push(Number(object[i]._rn) - 1)
        }
        else {
          const originItem = originObject.filter(
            (item: any) => item[compareKey] === id,
          )

          if (PageUtils.isChange4Kendo(object[i], originItem[0])) {
            chgCnt++
            object[i]._rowType = 'U'
            changedRows.push(Number(object[i]._rn) - 1)
          }
        }
      }

      console.log('changedRows......111', changedRows)

      if (chgCnt === 0)
        return false

      else
        return true
    }
    else {
      return PageUtils.isChange4Kendo(object, originObject)
    }
  },

  isChange4Grid: (adaptor: any) => {
    // 데이터 변경여부
    let chgCnt = 0
    const compareKey = adaptor.keyField
    const object = adaptor.viewData
    const originObject = adaptor.data

    if (Array.isArray(object) || Array.isArray(originObject)) {
      adaptor.changedRowsIndex = []
      for (let i = 0; i < object.length; i++) {
        const id = object[i][compareKey]
        let isChangedRow = false

        if (object[i]._rowType === 'I') {
          chgCnt++
          adaptor.changedRowsIndex.push(Number(object[i]._rn) - 1)
          isChangedRow = true
        }
        else {
          const originItem = originObject.filter(
            (item: any) => item[compareKey] === id,
          )

          if (PageUtils.isChange4Kendo(object[i], originItem[0])) {
            chgCnt++
            object[i]._rowType = 'U'
            adaptor.changedRowsIndex.push(Number(object[i]._rn) - 1)
            isChangedRow = true
          }
          else {
            object[i]._rowType = ''
          }
        }

        // if(isChangedRow){ // 필수체크
        //   const colums = adaptor.columns
        //   for(let x = 0 ; x < colums.length ; x++){
        //     const title = colums[x].title
        //     const required = colums[x]._required === undefined ? false : colums[x]._required
        //     const value = object[i][colums[x].field]
        //     if(colums[x].field && required){
        //       if(value === undefined || value === ""){
        //         alert("[필수입력항목]" + title)
        //         return
        //       }
        //     }
        //   }
        // }
      }

      console.log('changedRows......222', adaptor.changedRowsIndex)

      if (chgCnt === 0)
        return false

      else
        return true
    }
    else {
      return PageUtils.isChange4Kendo(object, originObject)
    }
  },

  isChange4Kendo: (object: any, originObject: any) => {
    // 데이터 변경여부 kendo
    const obj = JSON.parse(JSON.stringify(object)) // structuredClone(toRaw(object))
    const obj2 = JSON.parse(JSON.stringify(originObject)) // structuredClone(toRaw(originObject))

    if (obj._rowType === undefined)
      obj._rowType = ''

    if (originObject === undefined) {
      // 신규행의 경우 origin 존재하지 않는다.
      return true
    }

    if (obj2._rowType === undefined)
      obj2._rowType = ''

    obj._rowType = ''
    obj2._rowType = ''

    obj._rn = -1
    obj2._rn = -1

    obj._dateFieldProps = ''
    obj2._dateFieldProps = ''

    const str1 = JSON.stringify(obj).trim()
    const str2 = JSON.stringify(obj2).trim()

    // console.log("isChange str1......", str1)
    // console.log("isChange str2......", str2)

    if (str1 === str2) {
      // console.log("isChange false......333");
      return false
    }
    else {
      // console.log("isChange str1......", str1)
      // console.log("isChange str2......", str2)

      // console.log("isChange true......333");
      return true
    }
  },

  apply4ChangedItems: (svid: string, adaptor?: any, changedItems?: any, multiCodeFileds?: any) => {
    // adaptor : adaptor or object
    let isAdaptor = false
    if (PageUtils.isNull(adaptor.name, '') !== '') {
      if (ADAPTOR_TYPE.hasOwnProperty(adaptor.name.toUpperCase()))
        isAdaptor = true
    }

    // 10. adaptor 사용시
    if (isAdaptor) {
      for (let i = 0; i < changedItems.length; i++) {
        const filtered = adaptor._data.filter((item: any) => { // _data : important !!!
          return item.id === changedItems[i].id
        })

        const r = Object.keys(filtered[0]).find(key => {
          if (changedItems[i].hasOwnProperty(key))
            filtered[0][key] = changedItems[i][key] // 현재 items 필드 기준
        })

        filtered[0]._rowType = ''
        PageUtils.code4VSelectMultiple(filtered[0], multiCodeFileds) // 멀티코드 string --> array
      }

      adaptor._setDataPost = true // important !!!
    }
    else {
      alert('not defined.....')
    }
  },

  responsePost: (
    svid: string,
    dataItems?: any, // adaptor.value  or dataItems.value (list)
    dataItem?: any, // item (현재 처리중인 데이터)
    rtnData?: any, // response 결과
    multiCodeFileds?: any, // 멀티코드 필드 : for adaptor
    origin4dataItem?: any, // drawer 열릴때 최초 데이터
    isDataelements?: boolean, // rtn data >> dataelements 여부
    keepData?: boolean, // 일치하는 key 없을경우 원래값 유지
    newIndex?: number, // 신규입력시 추가될 row index : _data 기준
  ) => {
    // adaptor : adaptor or object
    let isAdaptor = false
    let isListApply = true

    keepData = keepData === undefined ? false : keepData
    isDataelements = isDataelements === undefined ? false : isDataelements
    newIndex = newIndex === undefined ? -1 : newIndex

    if (PageUtils.isObjectEmpty(dataItems))
      isListApply = false

    if (isListApply) {
      if (PageUtils.isNull(dataItems.name, '') !== '') {
        if (ADAPTOR_TYPE.hasOwnProperty(dataItems.name.toUpperCase()))
          isAdaptor = true
      }
    }

    let adaptor: any = []
    if (isAdaptor)
      adaptor = dataItems

    // drawer 에서 저장한것으로 간주
    // 필요시 loop 처리할것.
    let rtnDataItem = PageUtils.cloneObject(rtnData.data[0])
    if (isDataelements) {
      const tmp = PageUtils.cloneObject(rtnData.data[0])

      rtnDataItem = rtnData.data[0].dataelements // task 프로퍼티 저장시

      rtnDataItem.id = tmp.id
      rtnDataItem.type = tmp.type

      rtnDataItem.relId = tmp.relId
      rtnDataItem.cestamp = tmp.cestamp

      // console.log("xxxxxxxxxx", PageUtils.cloneObject(rtnDataItem) )
    }

    if (svid === 'S') {
      // ownerInfo
      if (rtnDataItem.ownerInfo !== undefined && rtnDataItem.ownerInfo !== null && rtnDataItem.ownerInfo.length > 0) {
        if (isDataelements) {
          rtnDataItem.dataelements.ownerfullname = `${rtnDataItem.ownerInfo[0].lastname} ${rtnDataItem.ownerInfo[0].firstname}`
          rtnDataItem.dataelements.ownerFullname = `${rtnDataItem.ownerInfo[0].lastname} ${rtnDataItem.ownerInfo[0].firstname}`
        }
        else {
          rtnDataItem.ownerfullname = `${rtnDataItem.ownerInfo[0].lastname} ${rtnDataItem.ownerInfo[0].firstname}`
          rtnDataItem.ownerFullname = `${rtnDataItem.ownerInfo[0].lastname} ${rtnDataItem.ownerInfo[0].firstname}`
        }
      }
      else {
        // owner: "C13869"
        rtnDataItem.ownerfullname = useCodeStore().getPersonName(rtnDataItem.owner)
        rtnDataItem.ownerFullname = useCodeStore().getPersonName(rtnDataItem.owner)
      }

      // insert or update
      if (dataItem._rowType === 'I') {
        PageUtils.code4VSelectMultiple(rtnDataItem, multiCodeFileds) // 멀티코드 string --> array

        if (isAdaptor) {
          if (newIndex >= 0)
            adaptor._data.splice(newIndex, 0, rtnDataItem)

          else
            adaptor._data.push(rtnDataItem) // rtnData.data[0]
        }
        else {
          if (isListApply) {
            dataItems.push(rtnDataItem)
          }
          else {
            //
          }
        }

        if (!PageUtils.isObjectEmpty(origin4dataItem)) {
          // 변경사항 다시 비교할때 대비해서.. 초기화
          const r3 = Object.keys(rtnDataItem).find(key => { // 신규입력 후 현재데이터 데이터 갱신
            dataItem[key] = rtnDataItem[key]
          })

          dataItem._rowType = ''
        }

        const r10 = Object.keys(origin4dataItem).find(key => {
          delete origin4dataItem[key]
        })

        const r20 = Object.keys(dataItem).find(key => { // 신규입력 후 원본 == 현재데이터 동기화
          origin4dataItem[key] = dataItem[key]
        })
      }
      else {
        let filtered: any = []
        if (isAdaptor) {
          filtered = adaptor._data.filter((item: any) => {
            return item.id === dataItem.id
          })
        }
        else {
          if (isListApply) {
            filtered = dataItems.filter((item: any) => {
              return item.id === dataItem.id
            })
          }
        }

        if (isListApply) {
          const r = Object.keys(filtered[0]).find(key => {
            if (rtnDataItem.hasOwnProperty(key)) {
              filtered[0][key] = rtnDataItem[key]
            }
            else {
              if (keepData) {
                // keep
              }
              else {
                filtered[0][key] = null
              }
            }
          })

          filtered[0]._rowType = ''
          PageUtils.code4VSelectMultiple(filtered[0], multiCodeFileds) // 멀티코드 string --> array
        }

        const r2 = Object.keys(dataItem).find(key => {
          if (rtnDataItem.hasOwnProperty(key))
            dataItem[key] = rtnDataItem[key]
        })

        dataItem._rowType = ''

        if (!PageUtils.isObjectEmpty(origin4dataItem)) {
          // 주의) 아래처럼 대입하면 호출한쪽에는 변경되지 않는다.
          // origin4dataItem = PageUtils.cloneObject(dataItem)

          const r1 = Object.keys(origin4dataItem).find(key => {
            delete origin4dataItem[key]
          })

          const r3 = Object.keys(dataItem).find(key => {
            origin4dataItem[key] = dataItem[key]
          })
        }
      }

      console.log('xxxxxxxxxx', dataItem, origin4dataItem)
    }
    else if (svid === 'D') {
      // delete
      // local data delete
      if (isAdaptor) {
        const indexToRemove = adaptor._data.findIndex(
          (item: any) => item.id === dataItem.id,
        )

        adaptor._data.splice(indexToRemove, 1)
      }
      else {
        if (isListApply) {
          const indexToRemove = dataItems.findIndex(
            (item: any) => item.id === dataItem.id,
          )

          dataItems.splice(indexToRemove, 1)
        }
      }

      if (!PageUtils.isObjectEmpty(origin4dataItem)) {
        // 주의) 아래처럼 대입하면 호출한쪽에는 변경되지 않는다.
        // origin4dataItem = PageUtils.cloneObject(dataItem)

        const r1 = Object.keys(origin4dataItem).find(key => {
          delete origin4dataItem[key]
        })

        const r3 = Object.keys(dataItem).find(key => {
          origin4dataItem[key] = dataItem[key]
        })
      }
    }

    if (isAdaptor) {
      if ([ADAPTOR_TYPE.GRID, ADAPTOR_TYPE.TREE].includes(adaptor.name))
        adaptor._setDataPost = true // important !!!

      else
        adaptor.refreshViewData()
    }
  },

  isExistsObj: (obj: any) => {
    if (obj === undefined || obj === null)
      return false

    else
      return true
  },

  isNull4Num: (num: any, repNum: number) => {
    if (num === undefined || num === null || num === '' || num === '0'
      || num === 'undefined' || num === 'null' || num === 'NaN' || isNaN(num))
      num = repNum

    return parseFloat(num)
  },

  isNull: (num: any, repNum: string) => {
    if (num === undefined || num === null || num === '')
      num = repNum

    return num
  },

  num4Digit: (n2: any) => { // 3자리컴마
    return n2.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
  },

  isStrEmpty: (str: any) => {
    if (str === undefined || str === null || str === '')
      return true

    else
      return false
  },
  isObjectEmpty: (item: any) => { // item.value --> item
    if ((item !== undefined && item !== null))
      return false

    else
      return true
  },
  isRefEmpty: (item: any) => { // item.value --> item
    // console.log("item.....", typeof(item))
    if (item !== undefined && item !== null)
      return false

    else
      return true
  },
  isRefEmpty4Expose: (item: any) => { // item.value --> item  , 4 defineExpose
    console.log('item.....', typeof (item), item)
    if (typeof (item) === 'object') {
      if (item !== undefined && item !== null && item.length > 0) { // item.length > 0 important
        return false
      }
      else {
        return true
      }
    }
    else {
      return true
    }
  },
  closeCheck4Expose: (svid?: string, item4Ref?: any, checkFunc?: string) => {
    svid = (svid === undefined || svid === null) ? '' : svid
    item4Ref = (item4Ref === undefined || item4Ref === null) ? '' : item4Ref

    checkFunc = checkFunc === undefined ? 'drawerCloseCheck' : checkFunc

    const rtn4Close = PageUtils.cloneObject(PageUtils.default4Close)

    console.log('item4Ref.....', typeof (item4Ref), item4Ref)

    if (typeof (item4Ref) === 'object') {
      if (item4Ref !== undefined && item4Ref !== null && (item4Ref.length === undefined || item4Ref.length === 0)) {
        console.log('closeCheck4Expose check.....111111111', item4Ref, checkFunc)
        if (item4Ref[checkFunc] !== undefined && item4Ref[checkFunc].length !== undefined && item4Ref[checkFunc].length > 0)
          return item4Ref[checkFunc](svid)

        else
          return rtn4Close // close ok
      }
      else if (item4Ref !== undefined && item4Ref !== null && item4Ref.length > 0) {
        console.log('closeCheck4Expose check.....222222222', item4Ref, checkFunc)

        for (let x = 0; x < item4Ref.length; x++) {
          const rtn4Temp = item4Ref[x][checkFunc](svid)

          // console.log("closeCheck4Expose check.....3333333", rtn4Temp)
          if (!rtn4Temp.close)
            return rtn4Temp
        }

        return rtn4Close // close ok

        // if(item4Ref[0][checkFunc].length > 0){
        //   //console.log("xxxxxxxxxxxx", item4Ref)
        //   return item4Ref[0][checkFunc](svid)
        // }else{
        //   return rtn4Close // close ok
        // }
      }
    }
    else {
      return rtn4Close // close ok
    }
  },
  closeCheck4RefObject: (svid: string, refObject: any, checkFunc?: string) => {
    const rtn4Close = PageUtils.cloneObject(PageUtils.default4Close)
    if (svid !== SVID.CHECK_SKIP)
      return PageUtils.closeCheck4Expose(svid, refObject, checkFunc) // memberRatio4Ref >> drawerCloseCheck

    return rtn4Close
  },
  closeCheck4Adaptor: (svid: string, adaptor: any) => {
    const rtn4Close = PageUtils.cloneObject(PageUtils.default4Close)
    const chkMsg = svid === SVID.CANCEL ? 'MSG.cancelData' : 'MSG.chkChange'

    if (PageUtils.isChange4Grid(adaptor)) { // grid 변경여부 체크
      if (!PageUtils.confirm(chkMsg, '')) {
        rtn4Close.close = false

        return rtn4Close
      }
    }

    return rtn4Close
  },
  closeCheck4DataItem: (svid: string, dataItem: any, originDataItem: any) => {
    const rtn4Close = PageUtils.cloneObject(PageUtils.default4Close)
    const chkMsg = svid === SVID.CANCEL ? 'MSG.cancelData' : 'MSG.chkChange'

    if (PageUtils.isChange(dataItem, originDataItem)) {
      if (!PageUtils.confirm(chkMsg, '')) {
        rtn4Close.close = false

        return rtn4Close
      }
    }

    return rtn4Close
  },
  default4Close: { // drawer close return ==> 복제해서 사용할것.
    close: true, // close ok
    dataChanged: false, // data no changed
  },

  trace: (log0?: any, log1?: any, log2?: any, log3?: any, log4?: any, log5?: any, log6?: any, log7?: any) => {
    // console.log("aaaaaaaaaaaaaaaaaa", import.meta.env.DEV)
    if (import.meta.env.DEV) {
      if (log7 !== undefined)
        console.log(log0, log1, log2, log3, log4, log5, log6, log7)
      if (log6 !== undefined)
        console.log(log0, log1, log2, log3, log4, log5, log6)
      if (log5 !== undefined)
        console.log(log0, log1, log2, log3, log4, log5)
      if (log4 !== undefined)
        console.log(log0, log1, log2, log3, log4)
      if (log3 !== undefined)
        console.log(log0, log1, log2, log3)
      if (log2 !== undefined)
        console.log(log0, log1, log2)
      if (log1 !== undefined)
        console.log(log0, log1)
      if (log0 !== undefined)
        console.log(log0)
    }
  },

  gridHeight: (grid: any, div0?: any, div1?: any, div2?: any, div3?: any) => {
    // console.log("gridHeight......", grid)

    // PageUtils.setStyle(); // ##### setStyle #####

    if (grid === null)
      return 0
    if (grid === undefined)
      return 0

    let ele = grid.parentElement
    let mainDiv = null
    let isDrawer = false
    let drawerHeight = 0

    for (let i = 0; i < 40; i++) {
      if (ele === null || ele.parentElement === null)
        continue

      ele = ele.parentElement

      // console.log("8888 offsetLeft.....", ele.nodeName, ele.className, ele.offsetHeight)

      if (ele === null || ele.nodeName === null)
        continue

      // drawer
      if (ele.nodeName !== undefined && ele.nodeName !== null
        && !isDrawer
        && ele.nodeName === 'DIV'
        && ele.classList.contains('v-navigation-drawer__content')
      ) {
        isDrawer = true
        drawerHeight = ele.offsetHeight
      }

      // drawer >> tab xxx
      if (ele.classList.contains('v-slide-group__content')) {
        // alert(ele.nodeName)
      }

      if (ele != null && ele.nodeName.toUpperCase() === 'MAIN') {
        // console.log("MAIN offsetLeft.....", ele.nodeName, ele.className, ele.offsetHeight)
        // height = ele.offsetLeft
        mainDiv = ele
        break
      }
    }

    // console.log("grid.offsetTop", grid.offsetTop )
    // console.log("searchDiv.offsetHeight", mainDiv.offsetHeight )
    const heightCom = PageUtils.getComHeight()

    // let titleBar = 90
    // let topMargin = 16
    // let bottomMargin = 16
    const div0H = div0 ? div0.offsetHeight : 0 // searchDiv
    const div1H = div1 ? div1.offsetHeight : 0
    const div2H = div2 ? div2.offsetHeight : 0
    const div3H = div3 ? div3.offsetHeight : 0

    // console.log("gridHeight 22 ", mainDiv.offsetHeight, titleBar ,topMargin , bottomMargin, div0H ,div1H, div2H, div3H )

    let finalHeight
      = heightCom.windowHeight
      - (heightCom.height4Remain + div0H + div1H + div2H + div3H)
    if (isDrawer)
      finalHeight = drawerHeight - (div0H + div1H + div2H + div3H)

    // console.log("finalHeight", isDrawer, finalHeight, drawerHeight, div0H)

    return finalHeight
  },

  getComHeight: () => {
    // 기본높이 정보
    // 기본 높이 정보
    const windowHeight = window.innerHeight // 브라우저 창 높이
    const windowWidth = window.innerWidth // 브라우저 창 너비

    const header = document.getElementsByClassName('navbar-content-container')
    const headerHeight = header.length === 0 ? 0 : header[0].clientHeight // 헤더(검색창) 높이

    const titilebar = document.getElementsByClassName('custom-title-bar')

    const titilebarHeight
      = titilebar.length === 0 ? 0 : titilebar[0].clientHeight // 타이틀바 높이

    const padding_top = 24 // 컨텐츠영역 패딩
    const padding_bottom = 24 // 컨텐츠영역 패딩

    const footer = document.getElementsByClassName('layout-footer')
    const footerHeight = footer.length === 0 ? 0 : footer[0].clientHeight // 푸터 높이

    return {
      windowHeight,
      windowWidth,
      headerHeight,
      titilebarHeight,
      padding_top,
      padding_bottom,
      footerHeight,
      height4Remain:
        headerHeight
        + titilebarHeight
        + padding_bottom
        + padding_top
        + footerHeight,
    }
  },

  getHeight: (className: string) => {
    console.log('getHeight class', className)
    let height = 0
    if (className.includes('.')) {
      height = PageUtils.isNull4Num(document.querySelector(className)?.clientHeight, 0)
    }
    else {
      const domObj = document.getElementsByClassName(className)

      // console.log("getHeight domObj", domObj, domObj[0])
      if (domObj[0] === undefined)
        return 0
      height = domObj[0].clientHeight
    }

    return height
  },

  getWidth: (className: string) => {
    let width = 0

    // const ele = document.querySelector(".page-content-container")
    if (className.includes('.')) {
      width = PageUtils.isNull4Num(document.querySelector(className)?.clientWidth, 0)
    }
    else {
      const domObj = document.getElementsByClassName(className)
      if (domObj[0] === undefined)
        return 0
      width = domObj[0].clientWidth
    }

    return width
  },

  getDrawerWidth: () => {
    // const ele = document.querySelector(".page-content-container")
    const width = document.querySelector('.page-content-container')?.clientWidth
    const drawerObj = document.getElementsByClassName('v-navigation-drawer v-navigation-drawer--active')
    let width2 = 0
    if (drawerObj.length > 0)
      width2 = drawerObj[drawerObj.length - 1].clientWidth

    if (PageUtils.isNull4Num(width2, 0) > 0)
      return PageUtils.isNull4Num(width2, 0) - CHILD_WIDTH.DRAWER // drawer --> drawer

    else
      return PageUtils.isNull4Num(width, 0) - CHILD_WIDTH.DRAWER
  },

  isOnDrawer: (svid?: string) => { // drawer 안에서 열리는지 여부
    svid = svid === undefined ? '' : svid

    const drawerObj = document.getElementsByClassName('v-navigation-drawer--active')

    // const drawerObj = document.querySelector(".v-navigation-drawer .v-navigation-drawer--active")
    // if(drawerObj === undefined || drawerObj === null) return false

    console.log('isOnDrawer.........', svid, drawerObj.length)
    if (drawerObj.length > 0)
      return true

    // if(drawerObj2.length > 0) return true
    return false
  },

  resetNavZindex: (isBelow: boolean) => { // .layout-content-width-boxed .layout-page-conten
    // VerticalNav.vue  >> resetNavZindex 와 연동할것.
    if (isBelow) { // drawer 등이 열릴때 left menu 가 drawer dimmed 아래로 가도록...
      const style = document.documentElement.style

      style.setProperty('--z-index-reset', '1002')
    }
    else { // drawer 등이 닫힐때 원상태복귀
      const style = document.documentElement.style

      style.setProperty('--z-index-reset', '1006') // 1006
    }
  },

  getPrimaryColor: () => {
    try {
      const vuetifyTheme0 = useTheme()

      // vue mounted 할때는 정상이나, resizing 될때는 Vuetify] useTheme must be called from inside a setup functionat getCurrentInstance 오류발생
      // resizing 일때는 하단 내용을 실행하지 않는다.
    }
    catch (error) {
      return null
    }

    // 👉 Primary Color
    const vuetifyTheme = useTheme()

    // console.log("vuetifyTheme...", vuetifyTheme)
    const currentThemeName = vuetifyTheme.name.value
    const primary = vuetifyTheme.themes.value[currentThemeName].colors.primary

    console.log('vuetifyTheme.themes.value[currentThemeName]', currentThemeName)

    return primary
  },

  getThemeName: () => { // light or dark
    try {
      const vuetifyTheme0 = useTheme()
    }
    catch (error) {
      return null
    }
    const vuetifyTheme = useTheme()

    return vuetifyTheme.name.value
  },

  setStyle: () => { // not used....
    // const primary = PageUtils.getPrimaryColor();

    // if (primary === undefined || primary === null) return;dfasdf

    // console.log("setStyle primary ....", primary);

    // const style = document.documentElement.style;
    // style.setProperty("--primary-color", primary);
    // style.setProperty("--info-color", primary);

    // if(PageUtils.getThemeName() === "dark"){
    //   style.setProperty("--initial-loader-bg", "#9155FD");
    // }else{
    //   style.setProperty("--initial-loader-bg", "#fff");
    // }
  },

  getChartColor: (svid: string, index: number) => {
    const colors: any = DASHBOARD_COLOR
    let idx = index % 12 // 12개 기준
    if (idx === 0)
      idx = 12

    // console.log("xxxxxxxxxxxxx", idx, colors["CHART_BAR_SERIES_" + idx])
    return PageUtils.isNull(colors[`CHART_BAR_SERIES_${idx}`], '#41B3B3')
  },

  _tabTitle4Risk: () => { return useCodeStore().Dic('TABS.' + 'Risk') },
  _tabTitle4Issue: () => { return useCodeStore().Dic('TABS.' + 'Issue') },
  _tabTitle4Comment: () => { return useCodeStore().Dic('TABS.' + 'Comment') },
  _tabTitle4Property: () => { return useCodeStore().Dic('TABS.' + 'Property') },
  _tabTitle4Reg: () => { return useCodeStore().Dic('TABS.' + 'Reg') },
  _tabTitle4Members: () => { return useCodeStore().Dic('TABS.' + 'Members') },
  _tabTitle4Contents: () => { return useCodeStore().Dic('TABS.' + 'Contents') },
  _tabTitle4Summary: () => { return useCodeStore().Dic('TABS.' + 'Summary') },
  _tabTitle4ProjectDashBoard: () => { return useCodeStore().Dic('TABS.' + 'Summary') },
  _tabTitle4Goal: () => { return useCodeStore().Dic('TABS.' + 'Goal') },
  _tabTitle4Schedule: () => { return useCodeStore().Dic('TABS.' + 'Schedule') },
  _tabTitle4Gantt: () => { return useCodeStore().Dic('TABS.' + 'Gantt') },
  _tabTitle4Tasks: () => { return useCodeStore().Dic('TABS.' + 'Tasks') },
  _tabTitle4Notebook: () => { return useCodeStore().Dic('TABS.' + 'Notebook') },
  _tabTitle4Budget: () => { return useCodeStore().Dic('TABS.' + 'Budget') },
  _tabTitle4Patent: () => { return useCodeStore().Dic('TABS.' + 'Patent') },
  _tabTitle4Resource: () => { return useCodeStore().Dic('TABS.' + 'Resource') },
  _tabTitle4ResourcePlan: () => { return useCodeStore().Dic('TABS.' + 'ResourcePlan') },
  _tabTitle4RndContribution: () => { return useCodeStore().Dic('TABS.' + 'RndContribution') },
  _tabTitle4Assign: () => { return useCodeStore().Dic('TABS.' + 'Assign') },
  _tabTitle4PhaseGate: () => { return useCodeStore().Dic('TABS.' + 'PhaseGate') },

  _tabTitle4CostInvest: () => { return useCodeStore().Dic('TABS.' + 'CostInvest') },
  _tabTitle4Cost: () => { return useCodeStore().Dic('TABS.' + 'Cost') },
  _tabTitle4Invest: () => { return useCodeStore().Dic('TABS.' + 'Invest') },

  _tabTitle4System: () => { return useCodeStore().Dic('TABS.' + 'System') },
  _tabTitle4Document: () => { return useCodeStore().Dic('TABS.' + 'Document') },
  _tabTitle4Project: () => { return useCodeStore().Dic('TABS.' + 'Project') },
  _tabTitle4Assignee: () => { return useCodeStore().Dic('TABS.' + 'Assignee') },
  _tabTitle4Milestone: () => { return useCodeStore().Dic('TABS.' + 'Milestone') },

  _tabTitle4Result: () => { return useCodeStore().Dic('TABS.' + 'Result') },

  _actionSMTitle4Add4Notebook: () => { return useCodeStore().Dic('BUTTON.' + 'add4Notebook') },
  _actionSMTitle4Add: () => { return useCodeStore().Dic('BUTTON.' + 'add') },
  _actionSMTitle4Save: () => { return useCodeStore().Dic('BUTTON.' + 'save') },
  _actionSMTitle4Delete: () => { return useCodeStore().Dic('BUTTON.' + 'delete') },
  _actionSMTitle4Close: () => { return useCodeStore().Dic('BUTTON.' + 'close') },
  _actionSMTitle4TaskCompelte: () => { return useCodeStore().Dic('BUTTON.' + 'taskComplete') },
}

// Ctrl + Shift + P
// (주의) PageUtils 함수를 사용해야하므로 PageUtils 가 먼저 위치해 있어야함.
export const TABS = {
  RISK: { id: 'Risk', icon: 'mdi-alert-outline', title: PageUtils._tabTitle4Risk },
  ISSUE: { id: 'Issue', icon: 'mdi-alert-circle-outline', title: PageUtils._tabTitle4Issue },
  COMMENT: { id: 'Comment', icon: 'mdi-comment-processing', title: PageUtils._tabTitle4Comment },
  PROPERTY: { id: 'Property', icon: 'mdi-ballot-outline', title: PageUtils._tabTitle4Property },
  REG: { id: 'Reg', icon: 'mdi-view-dashboard-edit-outline', title: PageUtils._tabTitle4Reg },
  MEMBERS: { id: 'Members', icon: 'mdi-account-multiple', title: PageUtils._tabTitle4Members },
  CONTENTS: { id: 'Contents', icon: 'mdi-gift-outline', title: PageUtils._tabTitle4Contents },
  SUMMARY: { id: 'Summary', icon: 'mdi-web-box', title: PageUtils._tabTitle4Summary },
  GOAL: { id: 'Goal', icon: 'mdi-flag-checkered', title: PageUtils._tabTitle4Goal },

  ASSIGN: { id: 'Assign', icon: 'mdi-calendar-clock', title: PageUtils._tabTitle4Assign },
  SCHEDULE: { id: 'Schedule', icon: 'mdi-calendar-clock', title: PageUtils._tabTitle4Schedule },

  // PHASEGATE: {id: "PhaseGate", icon:"mdi-calendar-clock", title: PageUtils._tabTitle4PhaseGate},
  PROJECT_DASHBOARD: { id: 'ProjectDashBoard', icon: 'mdi-web-box', title: PageUtils._tabTitle4ProjectDashBoard },

  GANTT: { id: 'Gantt', icon: 'mdi-chart-gantt', title: PageUtils._tabTitle4Gantt },
  TASKS: { id: 'Tasks', icon: 'mdi-file-tree', title: PageUtils._tabTitle4Tasks },
  NOTEBOOK: { id: 'Notebook', icon: 'mdi-book-outline', title: PageUtils._tabTitle4Notebook },
  BUDGET: { id: 'Budget', icon: 'mdi-cash-100 ', title: PageUtils._tabTitle4Budget },
  PATENT: { id: 'Patent', icon: 'mdi-license', title: PageUtils._tabTitle4Patent },

  RESOURCE: { id: 'Resource', icon: 'mdi-human-capacity-increase', title: PageUtils._tabTitle4Resource },
  RESOURCE_PLAN: { id: 'ResourcePlan', icon: 'mdi-human-capacity-increase', title: PageUtils._tabTitle4ResourcePlan },
  RND_CONTRIBUTION: { id: 'RndContribution', icon: 'mdi-cash-100', title: PageUtils._tabTitle4RndContribution },

  COST_INVEST: { id: 'CostInvest', icon: 'mdi-cash-100', title: PageUtils._tabTitle4CostInvest },
  COST: { id: 'Cost', icon: 'mdi-chart-line', title: PageUtils._tabTitle4Cost },
  INVEST: { id: 'Invest', icon: 'mdi-chart-line-stacked', title: PageUtils._tabTitle4Invest },

  // 아래 id 안맞으면 수정해서 사용할것.
  SYSTEM: { id: 'System', icon: 'mdi-desktop-classic', title: PageUtils._tabTitle4System },
  PROJECT: { id: 'Project', icon: 'mdi-alpha-p-box', title: PageUtils._tabTitle4Project },
  ASSIGNEE: { id: 'Assignee', icon: 'mdi-account-multiple', title: PageUtils._tabTitle4Assignee },
  DOCUMENT: { id: 'Document', icon: 'mdi-attachment', title: PageUtils._tabTitle4Document },
  MILESTONE: { id: 'Milestone', icon: 'mdi-sign-direction', title: PageUtils._tabTitle4Milestone },

  RESULT: { id: 'Result', icon: 'mdi-book-outline', title: PageUtils._tabTitle4Result },
}

export const ACTION_SM = {
  ADD: { id: 'add', icon: 'mdi-plus-outline', title: PageUtils._actionSMTitle4Add },
  SAVE: { id: 'save', icon: 'mdi-content-save-outline', title: PageUtils._actionSMTitle4Save },
  DELETE: { id: 'delete', icon: 'mdi-trash-can-outline', title: PageUtils._actionSMTitle4Delete },
  CLOSE: { id: 'close', icon: 'mdi-close', title: PageUtils._actionSMTitle4Close },

  ADD4NOTEBOOK: { id: 'add4Notebook', icon: 'mdi-flask-plus', title: PageUtils._actionSMTitle4Add4Notebook },
  TASK_COMPLETE: { id: 'taskComplete', icon: 'mdi-timer-sand-complete', title: PageUtils._actionSMTitle4TaskCompelte },
}

export const RequestUtils = {
  getErrMsg: (error: any) => {
    console.log('error......', error)

    const rtn = { success: false, data: [], items: 0 }

    if (error.response === undefined) {
      console.log(`[error0] ${error}`)

      return rtn
    }

    if (error.response.status !== 200) {
      if (error.response.data !== undefined && error.response.data.error !== undefined) { //
        // message
        if (error.response.data.error !== undefined) {
          if (error.response.data.error.message === undefined) { // error.response.data.error 에 메세지가 담김
            alert(`${error.response.data.error} [${error.response.data.statusCode}] `)
          }
          else {
            alert(`${error.response.data.error.message} [${error.response.data.error.code}] `)
          }

          return rtn
        }

        let internalError = error.response.data.internalError !== undefined ? error.response.data.internalError : '' //
        if (internalError === '')
          internalError = error.response.data.error

        alert(`${internalError} [${error.response.data.statusCode}] `) // internalError

        return rtn
      }

      if (error.message !== undefined) {
        // alert(error.response.status + "\r" + error.message);
        console.error(`${error.response.status}\r${error.message}`)

        return rtn
      }
      else if (error.message === undefined) {
        if (error.message !== undefined) {
          // alert(error.response.status + " error");
          console.error(`${error.response.status} error`)

          return rtn
        }
      }
    }

    if (error.response !== undefined && error.response.data !== undefined) {
      const errorData = error.response.data
      if (errorData === undefined || errorData === '') {
        alert('This request has no resopnse data available.')

        const data = { success: false }

        error.response.data = data
      }
      else {
        const errorMsg = error.response.data.error
        let internalError = ''

        if (error.response.data.internalError !== undefined)
          internalError = error.response.data.internalError

        alert(`${errorMsg}\r${internalError}`) // 메세지 띄워주고
      }

      console.log(error.response)

      return rtn // error.response.data;
    }

    if (
      error.status !== undefined
      && (error.status === 404 || error.status === 503)
    ) {
      console.log(`[error] ${error.status} ${error.statusText}`)

      return rtn
    }
  },

}
