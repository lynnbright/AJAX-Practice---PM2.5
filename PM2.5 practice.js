$(document).ready(()=>{
  
  let url = 'https://opendata.epa.gov.tw/api/v1/ATM00766?%24skip=0&%24top=1000&%24format=json'

  //列出濃度最高前三名
  axios.get(url)
       .then(function(resp){
        // resp.data.filter(x => x.Concentration !== 'x')
        let filteredData = R.reject(x => x.Concentration === 'x', resp.data)
        let siteByConcentrations = R.groupBy(x => x.Concentration, filteredData) // {2: [], 3: []}
        let arySiteByConctr = Object.entries(siteByConcentrations) //[ ["2",[]], ["3",[]] ...]
        let sortedSites = R.take( 3, R.reverse(arySiteByConctr))                 
        let body = gotPairs(sortedSites) 
        let shows = body.forEach(function(item,index){
          $('.container').append(`<div style="inline-block"> <h2> 今日 PM 2.5 濃度指數 Top ${index + 1} ：${item} </h2></div>`)
        });
       })
 

  //全列，並依照濃度高低排列
  axios.get(url)
       .then(function(resp){
        let pm25List = resp.data  //一個陣列裡，有很多個 hash
        let pm25Reorder = pm25List.sort(function(a,b){
          return b.Concentration - a.Concentration
          })
        pm25Reorder.map(function(pm){
          let shows = allPmInfo(pm)
            $('.container').append(shows)
          })
  })

  function gotPairs(pairs){

    //濃度與地區數值
    let res = pairs.map(function(pair){  //["26", "25", "24"]
      let concentrationList = pair[0]
      let countySiteNameList = pair[1]  //[{}], [{},{}], [{},{},{},{}]
      let site = countySiteNameList.map(function(c){
        return c.County + " " + c.SiteName
      })
      return `${concentrationList}` + " ｜ " + `${site}`
    })
    return res
  }

  function allPmInfo (p){ 
    return `
    <br>
    <div>
      <ul>
        <li>縣市：${p.County} </li>
        <li>地點：${p.SiteName}</li>
        <li>濃度：${p.Concentration}</li>
        <li>最後更新時間：${p.MonitorDate}</li>
      </ul>
    </div>
    <br>
    `
  }
})