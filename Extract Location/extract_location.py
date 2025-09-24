from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

def get_gps_info(image_path):
    img = Image.open(image_path)
    exif_data = img._getexif()
    gps_info = {}
    for tag_id, value in exif_data.items():
        tag = TAGS.get(tag_id, tag_id)
        if tag == 'GPSInfo':
            for key in value.keys():
                decode = GPSTAGS.get(key, key)
                gps_info[decode] = value[key]
    return gps_info

gps_data = get_gps_info("photo.jpg")
print(gps_data)
