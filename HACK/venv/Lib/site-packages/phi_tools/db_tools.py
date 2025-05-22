# -*- ecoding: utf-8 -*-
# @ModuleName: db_tool.py
# @Function: 一些工具方法
# @Author: ctx_phi
# @Craete Time: 2021/12/29 10:37

import json
import os
from loguru import logger
import bson
from bson import json_util

import os
import sys
import bson
import re
from urllib.parse import unquote
from bson.py3compat import b
from loguru import logger
from bson import json_util
from sqlalchemy import create_engine
import pandas as pd



class BsontoJson:
    def __init__(self):
        file_path = str(sys.argv[1]) if len(sys.argv) > 1 else os.curdir
        if file_path == '.':
          logger.info("未输入路径参数，使用文件所在路径")
        else:
          logger.info("输入文件路径为【{}】".format(file_path))
        logger.info(
            '---------------bson文件路径：{}-----------------------'.format(file_path))
        self.path = file_path
        file_list = os.listdir()  # 当前文件夹路径
        self.file_list = [file for file in file_list if file[-4:] == 'bson']
        logger.info('检测到{}个bson数据，开始转换'.format(len(file_list)))
        return None


    def convert_one(self, file_name, output_path):
        with open(file_name, "rb") as f:
            data = bson.decode_all(f.read())
#         logger.debug(data)
        print(type(data))
        if type(data) == list:
#             print(data)
            with open(output_path, 'w') as f:
                f.write(json_util.dumps(data))
        else:
            logger.error("数据类型错误，不是list")


    def convert_many(self):
      for i, file in enumerate(self.file_list):
            logger.info('正在转换第{}个数据'.format(i+1))
            # 处理文件名称为中文
            renamed_file = unquote(file).replace('bson', 'json')
            logger.debug(renamed_file)
            self.convert_one(file, 'convert_file/'+renamed_file)
            logger.info('----------convert bson to json complete----------')



class FiletoSql:
    def __init__(self, usr, pwd, ip='159.226.251.226' , port=3000, dbname='hotrnak') -> None:
        self.conn = create_engine('mysql+pymysql://{}:{}@{}:{}/{}'.format(usr, pwd, ip, port ,dbname))
        pass

    def json_to_sql(self, **kwargs):
        # 只解析一个文件
        if kwargs['file']:
            df = pd.read_json(kwargs['file'])
            df.index.name = 'id'
            logger.debug(df.columns)
            
            # 转换数据类型
            df = df.applymap(str)
            try:
                df.to_sql(kwargs['file'].replace('.json', ''), self.conn, index=True, if_exists='fail')
            except Exception as e:
                pass 
            
        # 解析一个路径下的所有json
        if kwargs['dir']:
            file_list = os.listdir(kwargs['dir'])
            f2_list = [file for file in file_list if file[-5:] == '.json']
            for i,file in enumerate(f2_list):
                df = pd.read_json(file)
                df.index.name = 'id'
                logger.debug(df.columns)
                
                # 转换数据类型
                df = df.applymap(str)
                try:
                    df.to_sql(file.replace('.json', ''), self.conn, index=True, if_exists='fail')
                except Exception as e:
                    pass 



if __name__ == "__main__":
    btoj = BsontoJson()
    btoj.convert_many()
    