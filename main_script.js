import {Plot2D} from './Plot2D.js'

let canvas_ID_list=['lead_I','lead_II','lead_III','lead_aVR','lead_aVL','lead_aVF','lead_V1','lead_V2','lead_V3','lead_V4','lead_V5','lead_V6']
//initialize ecg data
let ecg_data = {}
canvas_ID_list.forEach(function(ID){
    ecg_data[ID] = []
})
//list of obj that holds all the canvas
let canvas_obj_list=[]
//parameter initialization
let x=100 
let click=false
let seg_head = 0
let seg_tail = 0
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
                    ecg_data = extract_ecg(fr.result,file_name)
                    //console.log(ecg_data)
                    init_ecg(ecg_data)
                }

            }else{                            //redraw the canvas
                
                let fr=new FileReader()
                fr.readAsText(this.files[0])
                file_name=this.files[0].name
                fr.onload=function(){
                    ecg_data = extract_ecg(fr.result)
                    init_ecg(string_data)
                    redraw_ecg(fr.result)
                }
            } 
                
        })

function extract_ecg( raw_string , file_name ){
    let file_type = file_name.split('.').slice(-1)[0]
    if(file_type === 'txt'){
        let index_data=raw_string.indexOf('[Data]')
         //split the string and get rid of the last element, which is space
        let string_data=raw_string.slice(index_data+8).split('\r\n')
        string_data.pop()
        string_data.forEach(function(one_row){
            let one_instance = one_row.split(',')
            canvas_ID_list.forEach(function(ID){
            switch (ID) {
                case 'lead_I':
                    ecg_data[ID].push(parseFloat(one_instance[0]))
                    break
                case 'lead_II':
                    ecg_data[ID].push(parseFloat(one_instance[1]))
                    break
                case 'lead_III':
                    ecg_data[ID].push(parseFloat(one_instance[2]))
                    break
                case 'lead_aVR':
                    ecg_data[ID].push(parseFloat(one_instance[3]))
                    break
                case 'lead_aVL':
                    ecg_data[ID].push(parseFloat(one_instance[4]))
                    break
                case 'lead_aVF':
                    ecg_data[ID].push(parseFloat(one_instance[5]))
                    break
                case 'lead_V1':
                    ecg_data[ID].push(parseFloat(one_instance[6]))
                    break
                case 'lead_V2':
                    ecg_data[ID].push(parseFloat(one_instance[7]))
                    break
                case 'lead_V3':
                    ecg_data[ID].push(parseFloat(one_instance[8]))
                    break
                case 'lead_V4':
                    ecg_data[ID].push(parseFloat(one_instance[9]))
                    break
                case 'lead_V5':
                    ecg_data[ID].push(parseFloat(one_instance[10]))
                    break
                case 'lead_V6':
                    ecg_data[ID].push(parseFloat(one_instance[11]))
                    break    
            }
            })
        })
        return ecg_data
    }else if(file_type === 'csv'){
        let string_data=raw_string.split('\r\n')
        string_data.shift()
        string_data.pop()
        //console.log(string_data)
        string_data.forEach(function(one_row){
            let one_instance = one_row.split(',')
            canvas_ID_list.forEach(function(ID){
                switch (ID) {
                    case 'lead_I':
                        ecg_data[ID].push(parseFloat(one_instance[3]))
                        break
                    case 'lead_II':
                        ecg_data[ID].push(parseFloat(one_instance[4]))
                        break
                    case 'lead_III':
                        ecg_data[ID].push(parseFloat(one_instance[5]))
                        break
                    case 'lead_aVR':
                        ecg_data[ID].push(parseFloat(one_instance[2]))
                        break
                    case 'lead_aVL':
                        ecg_data[ID].push(parseFloat(one_instance[1]))
                        break
                    case 'lead_aVF':
                        ecg_data[ID].push(parseFloat(one_instance[0]))
                        break
                    case 'lead_V1':
                        ecg_data[ID].push(parseFloat(one_instance[6]))
                        break
                    case 'lead_V2':
                        ecg_data[ID].push(parseFloat(one_instance[7]))
                        break
                    case 'lead_V3':
                        ecg_data[ID].push(parseFloat(one_instance[8]))
                        break
                    case 'lead_V4':
                        ecg_data[ID].push(parseFloat(one_instance[9]))
                        break
                    case 'lead_V5':
                        ecg_data[ID].push(parseFloat(one_instance[10]))
                        break
                    case 'lead_V6':
                        ecg_data[ID].push(parseFloat(one_instance[11]))
                        break    
                }
            })
        })
        return ecg_data
    }
    
}


function init_ecg(ecg_data){    
    let i = 0
    
    canvas_ID_list.forEach(function(id){
        //initialize plot
        let Plot2D_obj = new Plot2D()
        Plot2D_obj.init(ecg_data[id],id)

        document.getElementById(id).addEventListener('mousemove',function(event){
            x=event.clientX
            updataMarker(x)
        })

        document.getElementById(id).addEventListener('click',function(event){
            click=!click
            //flip the click condition
            
            if(click === true){
                seg_head=parseInt(event.clientX*Plot2D_obj.canvas_width/4000)
            }else{
                seg_tail=parseInt(event.clientX*Plot2D_obj.canvas_width/4000)
                seg_info.push([seg_head,seg_tail])
                //console.log(seg_info)
                updataSeg(seg_head,seg_tail)
            }
        })

        canvas_obj_list.push(Plot2D_obj)  
    })
    
    function updataMarker(x){
        canvas_obj_list.forEach(function(Plot2D_obj){
            Plot2D_obj.vertical_marker.position.x=x*Plot2D_obj.canvas_width/4000
        })
    }
    function updataSeg(seg_head,seg_tail){
        canvas_obj_list.forEach(function(Plot2D_obj){
            Plot2D_obj.addSeg(seg_head,seg_tail)
        })
    }
    //-----------add label for ECG----------------
    canvas_ID_list.forEach(function(ID){
        let dom_lable = document.createElement('span')
        dom_lable.innerHTML=ID
        let target_canvas = document.getElementById(ID)
        document.body.insertBefore(dom_lable,target_canvas)
    })
    
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
    let file_type = file_name.split('.').slice(-1)[0]
    let ID = ''
    if(file_type === 'txt'){
        ID = file_name.split(' ')[0]
    }else if(file_type === 'csv'){
        ID = file_name.split('.')[0]
        
    }
    let index_lable = IDs.indexOf(ID)
    let location = lables[index_lable]
    //initialize header of the .csv file
    let result = 'I,II,III,aVR,aVL,aVF,V1,V2,V3,V4,V5,V6,ID,seg_id,location\n'
    //save all segment result into one .csv file
    for(let i = 0;i < seg_info.length ; i++){
        for(let n = seg_info[i][0] ; n < seg_info[i][1] ; n++){
            canvas_ID_list.forEach(function(ID){
                result += ecg_data[ID][n] 
                result += ","
            })
            result += ID
            result += ','
            result += String(i)
            result += ','
            result += location
            result += ','
            result += '\n'
        }

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

