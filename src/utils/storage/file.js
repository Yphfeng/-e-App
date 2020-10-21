import FileManager from 'react-native-filesystem';

const filePath = './data.txt';


    /*写入内容到文件*/
    export function writeFile(obj){
        //  json转字符串
        return new Promise((resolve,reject) => {
            FileManager.writeToFile(filePath, JSON.stringify(obj))
                .then((data)=>{
                    console.log('写入成功', data); // data 为bool类型   TRUE or FALSE
                    resolve(data)
                })
                .catch((data)=>{
                    console.log('写入失败', data);
                    reject(data)
                });
        })    
    }
    /*读取文件*/
    export function readFile(){
        return new Promise((resolve,reject) => {


        FileManager.readFile(filePath)
            .then((data)=>{
                 //字符串转json
                console.log('读取成功', JSON.parse(data)); // data 为 txt 文件里面的内容
                resolve(data)
            })
            .catch((data)=>{
                console.log('读取失败', data);
                reject(data)
            });
        })    
    }
    /*删除文件*/
    export function deleteFile(){
        FileManager.delete(filePath)
            .then((data)=>{
                console.log('删除成功', data); // data 为bool类型   TRUE or FALSE
            })
            .catch((data)=>{
                console.log('删除失败', data);
            });
    }
    /*是否存在文件*/
    export function isExistFile(){
        return new Promise((resolve,reject) => {


        FileManager.fileExists(filePath)
            .then((data)=>{
                console.log('是否存在文件', data); // data 为bool类型   TRUE or FALSE
                resolve(data)
            })
            .catch((data)=>{
                console.log('是否存在文件失败', data);
                reject(data)
            });
        })    
    }
    /*返回绝对路径*/
    export function absoluteFile(){
        const absoluteFile = FileManager.absolutePath(filePath);
        console.log('absoluteFile = ', absoluteFile);
    }
