from PIL import Image
import io
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.utils.deconstruct import deconstructible
from rest_framework.exceptions import ValidationError


class FileExtensionValidator:
    """Validator for checking extensions of uploaded files."""

    def __init__(self, allowed_extensions=None):
        if allowed_extensions is None:
            allowed_extensions = ['jpg', 'jpeg', 'png', 'gif']
        self.allowed_extensions = [ext.lower() for ext in allowed_extensions]

    def __call__(self, file):
        ext = file.name.split('.')[-1].lower()
        if ext not in self.allowed_extensions:
            raise ValidationError(f'Invalid file format. Allowed: {', '.join(self.allowed_extensions)}.')


@deconstructible
class BaseFileValidator:
    """A basic validator for image processing."""

    ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
    MAX_IMAGE_WIDTH = 320
    MAX_IMAGE_HEIGHT = 240

    def validate_image(self, image):
        """Checks the image and reduces it if it is larger than the allowed size."""
        try:
            img = Image.open(image)
            if img.width > self.MAX_IMAGE_WIDTH or img.height > self.MAX_IMAGE_HEIGHT:
                img.thumbnail((self.MAX_IMAGE_WIDTH, self.MAX_IMAGE_HEIGHT))  # Пропорциональное уменьшение
                return self._save_resized_image(img, image)

        except Exception as e:
            raise ValidationError(f'Image processing error: {e}')

        return image

    def _save_resized_image(self, img, original_file):
        """Saves the thumbnail image in memory and creates a new file."""
        img_io = io.BytesIO()
        img_format = 'JPEG' if original_file.name.endswith('.jpg') else img.format
        img.save(img_io, format=img_format, quality=90)  # Сжатие

        return InMemoryUploadedFile(
            img_io, None, original_file.name, original_file.content_type, img_io.tell(), None
        )


class FileValidator(BaseFileValidator):
    """Validator for images (320x240) and text files (.txt, up to 100KB)."""

    MAX_TEXT_FILE_SIZE = 100 * 1024  # 100 KB

    def validate_file(self, file):
        """Determines whether the file is an image or a text file."""
        ext = file.name.split('.')[-1].lower()

        if ext == 'txt':
            return self.validate_text_file(file)
        elif ext in self.ALLOWED_IMAGE_EXTENSIONS:
            return self.validate_image(file)
        else:
            raise ValidationError(f'Invalid file format. Allowed: {', '.join(self.ALLOWED_IMAGE_EXTENSIONS)}.')

    def validate_text_file(self, file):
        """Checks the size of the text file (no larger than 100 KB)."""
        if file.size > self.MAX_TEXT_FILE_SIZE:
            raise ValidationError('Text file size should not exceed 100KB.')
        return file

    def __call__(self, file):
        return self.validate_file(file)


class AvatarValidator(BaseFileValidator):
    """Validator for avatars (images only, reduces to 100x100)."""

    MAX_IMAGE_WIDTH = 100
    MAX_IMAGE_HEIGHT = 100

    def __call__(self, avatar):
        """Checks avatar: images only and reduce to 100x100."""
        return self.validate_image(avatar)
