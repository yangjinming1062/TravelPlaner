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
                data = str_to_bytes(data)
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
            return bytes_to_str(_SECRET.decrypt(data))
