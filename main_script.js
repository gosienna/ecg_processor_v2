import {Plot2D} from './Plot2D.js'

let canvas_ID_list=['canvas_ECG_I','canvas_ECG_II','canvas_ECG_III','canvas_ECG_aVR','canvas_ECG_aVL','canvas_ECG_aVF','canvas_ECG_V1','canvas_ECG_V2','canvas_ECG_V3','canvas_ECG_V4','canvas_ECG_V5','canvas_ECG_V6']
//list of obj that holds all the canvas
let canvas_obj_list=[]
//parameter initialization
let x=100 
let click=false
let seg_head=0
let seg_tail=0
let string_data=''
let file_name = ''
//array to collect segment information
let seg_info=[]
//array to collect labling information
let IDs=[]
let lables=[]

//======================load CSV labling information=================================
document.getElementById('input_lable')
            .addEventListener('change', function() {  
            let fr=new FileReader()
            fr.readAsText(this.files[0])
            file_name=this.files[0].name
            fr.onload=function(){
                read_lable(fr.result)
            }
        })
function read_lable(raw_lable){
    let lable_data=raw_lable.split('\r\n')
    lable_data.forEach(function(e){
        let single_lable = e.split(',')
        IDs.push(single_lable[0])
        lables.push(single_lable[1])
    })  
}

//=====================load text file containing ecg infomation======================
document.getElementById('input_data')
            .addEventListener('change', function() {

            if (canvas_obj_list.length === 0){ //initialize the canvas
                
                let fr=new FileReader()
                fr.readAsText(this.files[0])
                file_name=this.files[0].name
                fr.onload=function(){
                    init_ecg(fr.result)
                }

            }else{                            //redraw the canvas
                
                let fr=new FileReader()
                fr.readAsText(this.files[0])
                file_name=this.files[0].name
                fr.onload=function(){
                    redraw_ecg(fr.result)
                }
            } 
                
        })

function init_ecg(raw_string){
    let index_data=raw_string.indexOf('[Data]')
    //split the string and get rid of the last element, which is space
    string_data=raw_string.slice(index_data+8).split('\r\n')
    string_data.pop()
    let i = 0
    canvas_ID_list.forEach(function(id){
        let ecg=[]
        string_data.forEach(element => {
        //element="I,II,III......"
        ecg.push(parseFloat(element.split(',')[i]))
        })
        i+=1

        //initialize plot
        let Plot2D_obj = new Plot2D()
        Plot2D_obj.init(ecg,id)

        document.getElementById(id).addEventListener('mousemove',function(event){
            x=event.clientX
            updataMarker(x)
        })

        document.getElementById(id).addEventListener('click',function(event){
            click=!click
            //flip the click condition
            
            if(click === true){
                seg_head=parseInt(event.clientX*Plot2D_obj.canvas_width/2000)
            }else{
                seg_tail=parseInt(event.clientX*Plot2D_obj.canvas_width/2000)
                seg_info.push([seg_head,seg_tail])
                //console.log(seg_info)
                updataSeg(seg_head,seg_tail)
            }
        })

        canvas_obj_list.push(Plot2D_obj)  
    })
    
    function updataMarker(x){
        canvas_obj_list.forEach(function(Plot2D_obj){
            Plot2D_obj.vertical_marker.position.x=x*Plot2D_obj.canvas_width/2000
        })
    }
    function updataSeg(seg_head,seg_tail){
        canvas_obj_list.forEach(function(Plot2D_obj){
            Plot2D_obj.addSeg(seg_head,seg_tail)
        })
    }
    
}

function redraw_ecg(raw_string){
    let index_data=raw_string.indexOf('[Data]')
    //split the string and get rid of the last element, which is space
    string_data=raw_string.slice(index_data+8).split('\r\n')
    string_data.pop()
    let i = 0
    let ecg=[]
    canvas_obj_list.forEach(function(obj){
        obj.clear_data()
        ecg = []
        string_data.forEach(element => {
        //element="I,II,III......"
        ecg.push(parseFloat(element.split(',')[i]))
        })
        i+=1
        obj.canvas_width = ecg.length
        obj.canvas_max = Math.max(...ecg)
        obj.canvas_min = Math.min(...ecg)
        obj.camera.left = 0
        obj.camera.right = obj.canvas_width
        obj.camera.top = obj.canvas_max
        obj.camera.bottom = obj.canvas_min
        obj.camera.updateProjectionMatrix()
        //console.log(obj.camera)
        //add vertical marker
        obj.add_vertical_marker()
        //add grid
        obj.add_grid()
        obj.data = ecg
        obj.draw_data(ecg)
        //render the scence
        obj.renderer.render( obj.scene, obj.camera);
    })

}

//==========================add 'save result' =============================button 
document.getElementById('save').addEventListener('click',function(){
    let ID = file_name.split(' ')[0]
    let index_lable = IDs.indexOf(ID)
    let location = lables[index_lable]
    //initialize header of the .csv file
    let result = 'I,II,III,aVR,aVL,aVF,V1,V2,V3,V4,V5,V6,ID,seg_id,location\n'
    //save all segment result into one .csv file
    for(let i = 0;i < seg_info.length ; i++){
        let string_seg = string_data.slice(seg_head,seg_tail)
        string_seg.forEach(function(row){
            let one_instance=row.split(',')
            for(let i = 0 ; i < 12 ; i++){
                result += one_instance[i] += ','
            }
            result += ID
            result += ','
            result += String(i)
            result += ','
            result += location
            result += ','
            result += '\n'
        })    
    }   

    //download file
    var hiddenElement = document.createElement('a');  
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(result);  
        hiddenElement.target = '_blank';     
        //provide the name for the CSV file to be downloaded  
        let save_name = ID
        hiddenElement.download = save_name;  
        hiddenElement.click();
        hiddenElement.remove();  
})

