from config import CONFIG
from cryptography.fernet import Fernet

from .functions import bytes_to_str
from .functions import str_to_bytes

_SECRET = Fernet(CONFIG.secret_key)


class SecretManager:
    """
    提供对称加解密的方法
    """

    @staticmethod
    def encrypt(data):
        """
        加密给定的数据并返回加密的结果。

        Parameters:
            data (str | bytes): 需要加密的数据。

        Returns:
            str: 加密的结果。
        """
        if data:
            if isinstance(data, str):
                data = data.encode("utf-8")  # 直接编码为bytes，而不是假设它是base64
            return bytes_to_str(_SECRET.encrypt(data))

    @staticmethod
    def decrypt(data):
        """
        解密给定数据并返回解码后的字符串。

        Args:
            data (bytes | str): 要解密的加密数据。

        Returns:
            str: 解码后的字符串。
        """
        if data:
            # 如果data是字符串，需要先转换为bytes（假设是base64编码的）
            if isinstance(data, str):
                data = str_to_bytes(data)
            # 解密后直接解码为UTF-8字符串，而不是转换为base64
            return _SECRET.decrypt(data).decode("utf-8")
