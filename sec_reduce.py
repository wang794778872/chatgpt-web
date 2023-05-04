import sys
import time
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import base64

avail_num=int(sys.argv[1])   #密钥可用额度
avail_count=int(sys.argv[2]) #密钥可用次数

# 获取当前时间戳（单位：秒）
timestamp = str(int(time.time()))

# 将参数和时间戳连接成一个字符串
data='{}{:0>4}{:0>4}{:0>4}'.format('ZL', avail_num, avail_count, timestamp[-8:])
# 使用 AES ECB 模式加密数据
key = b'zlwl20230419zlwl'

# 输出加密后的结果
print("明文:", data)

cipher = AES.new(key, AES.MODE_ECB)
encrypted_data = cipher.encrypt(pad(data.encode(), AES.block_size))

# 输出加密后的结果
print("密文:", encrypted_data.hex())
out=base64.b64encode(encrypted_data)
# print("密文:", out)
# print(base64.b64decode(out).hex())
print("生成新密钥：{}, 密钥携带额度{}, 密钥可激活次数{}".format(out.strip(b'=').decode(), avail_num, avail_count))

