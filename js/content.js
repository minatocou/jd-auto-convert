$(function(){
    var pageBtn=$('<input type="button" class="page-btn" value="保存到Copetus" / >').appendTo('body')
    pageBtn.on('click',function(){
        //chrome.tabs.create( { url:chrome.extension.getURL('./jd.html'), index:(S.tab.index+1), selected:false }, function(tab){
        //    setTimeout(function(){_send2Spliter(tab); },50 );
        //});
        var base=$('.resume-basic');
        var bInfo=$('.resume-basic-info');
        var jd = {
            jobText:base.find('p.text-center').text(),//在职情况
            //基本资料
            name: findTable(bInfo,0,0),//姓名
            sex:findTable(bInfo,0,1),//性别
            link:findTable(bInfo,1,0),//联系电话
            age:findTable(bInfo,1,1), //年龄
            email:findTable(bInfo,2,0),//邮箱
            edu:findTable(bInfo,2,1), //学历
            weixin:null,
            hunyin:findTable(bInfo,3,1), //学历
            jobYear:findTable(bInfo,4,0), //工作年限
            city:findTable(bInfo,4,1), //所在城市
            //职位概况
            szhy:findText('所在行业：','td'),//所在行业
            comName: findText('公司名称：','td'),//公司名称
            post: findText('公司职位：','td'),//职位名称
            pay: findText('目前薪资：','td'),//目前薪资
            //职业发展意向

            ei: findText('期望行业：','td'),//期望行业
            ej: findText('期望职位：','td'),//期望职位
            ec: findText('期望地点：','td'),//期望地点
            ep: findText('期望月薪：','td'),//期望月薪
            noCom:findText('勿推荐企业：','td'),//勿推荐企业
            //工作经验
            jobList:searchJob(), //工作经验
            peroductList:searchProduct(),//项目经验
            eduList:searchEdu() //教育经历
        }
        console.log(jd);
        chrome.runtime.connect().postMessage(jd);
    })
    function findTable(ele,row,col){
        var reg=new RegExp(".*：","g");
        var val=$.trim(ele.find('tr:eq('+row+') td:eq('+col+')').text()).replace(reg,'');
        console.log(val)
        return val;
    }
    function findText(text,dom,notReplace){
        if($.type(dom)=='string'){
            return notReplace? $(dom+":contains("+text+")").text() : $(dom+":contains("+text+")").text().replace(text,'');
        }else{
            var temp=dom.find(":contains("+text+"):last").text();
            return notReplace? temp : temp.replace(text,'')
        }

    }
    function searchJob(){
        var jobs=[];
        var job={
            workTime:null,//工作时间
            comName:null,//公司名
            duration:null,//工作时长
            type:null,//公司行业
            info:null,//公司描述
            jobTitle:null,//职位名
            personNum:null,//下属人数
            area:null,//所在地区
            section:null,//所在部门
            hobj:null,//汇报对象
            jd:null,//工作职责
            wp:null//工作业绩

        };
        var work=$('#workexp_anchor');
        var title=work.find('.resume-job-title');
        var indent=work.find('.resume-indent');
        indent.each(function(i){
            job={};
            job.workTime=title.eq(i).find('.work-time').text();
            job.comName=title.eq(i).find('.compony').text();
            job.duration=title.eq(i).find('.compony > span').text();
            job.type=indent.eq(i).find('table:first tr:eq(0) td:eq(0)').text();
            job.info=indent.eq(i).find('table:first tr:eq(1) td:eq(0)').text();
            job.jobTitle= indent.eq(i).find('.job-list-title strong').text();
            var temp=indent.eq(i).find('.job-list tr:eq(1)').text().split('|');
            for(var i=0;i<temp.length;i++){
                if(temp[i].match('汇报对象：')){
                    job.hobj=temp[i].replace('汇报对象：','')
                }
                if(temp[i].match('下属人数：')){
                    job.personNum=temp[i].replace('下属人数：','')
                }
                if(temp[i].match('所在区域：')){
                    job.area=temp[i].replace('所在地区：','')
                }
                if(temp[i].match('所在部门：')){
                    job.section=temp[i].replace('所在部门：','')
                }
            }
            console.log(indent.eq(i).find(":contains('工作职责')").text());
            job.jd= indent.eq(i).find(":contains('工作职责：'):last").next().text();
            job.wp= indent.eq(i).find(":contains('工作业绩：'):last").next().text();
            jobs.push(job);
        });
        return jobs;
    }
    function searchProduct(){
        var ps=[];
        var p={
            name:null,//项目名
            time:null,//时间
            com:null,//所在公司
            info:null,//项目简介
            pd:null//项目职责
        }
        var $ps=$('.project-list');
        $ps.each(function(i){
            $ps={};
            var $this=$(this);
            p.name=$this.find('.project-list-title > strong').text();
            p.time=$this.find('.project-list-title > span').text();
            p.com=findText('所在公司：',$this);
            p.info=findText('项目简介：',$this);
            p.info=findText('项目职责：',$this);
            ps.push(p);
        })
        return ps;
    }
    function searchEdu(){
        var es=[];
        var e={
            name:null,
            time:null,
            specialty:null,
            education:null,
            isUnify:null
        }
        var $es=$('.resume-education>table');
        $es.each(function(i){
            e = {};
            var $that=$(this);
            e.name=$that.find('tr:eq(0) td:eq(0) strong').text();
            e.time=$that.find('tr:eq(0) td:eq(0)').text();
            e.specialty=findText('专业：',$that);
            e.education=findText('学历：',$that);
            e.isUnify=findText('是否统招：',$that);
            es.push(e);
        })
        return es;
    }
})

//图片转base64
function convertImgToBase64(url, callback, outputFormat){
    var canvas = document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'),
        img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img,0,0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        canvas = null;
    };
    img.src = url;
}