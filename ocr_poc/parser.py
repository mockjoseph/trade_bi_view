import pytesseract
from PIL import Image
from llm import extract_receipt

img = Image.open("reciept.jpg")

img = img.convert("RGB")
img.save("temp.jpg")

test = pytesseract.image_to_string(Image.open("temp.jpg"))

json = extract_receipt(test)
print(json)