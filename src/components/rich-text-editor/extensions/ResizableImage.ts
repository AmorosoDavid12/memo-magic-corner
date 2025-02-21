
import Image from '@tiptap/extension-image';

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => ({
          width: attributes.width,
          style: `width: ${attributes.width}`,
        }),
      },
    }
  },
});

export default ResizableImage;
