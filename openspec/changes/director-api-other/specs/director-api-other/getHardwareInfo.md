## getHardwareInfo()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17176-17217

### Usage
```lingo

```

### Description
3D rendererServices method; returns a property list with information about the user’s video
card. The list contains the following properties:
#present is a Boolean value indicating whether the computer has hardware video acceleration.
#vendor indicates the name of the manufacturer of the video card.
#model indicates the model name of the video card.
#version indicates the version of the video driver.

332

Chapter 12: Methods

#maxTextureSize is a linear list containing the maximum width and height of a texture, in
pixels. Textures that exceed this size are downsampled until they do not. To avoid texture
sampling artifacts, author textures of various sizes and choose the ones that do not exceed the
#maxTextureSize value at run time.
#supportedTextureRenderFormats is a linear list of texture pixel formats supported by the
video card. For details, see textureRenderFormat.
#textureUnits indicates the number of texture units available to the card.
#depthBufferRange is a linear list of bit-depth resolutions to which the depthBufferDepth

property can be set.
#colorBufferRange is a linear list of bit-depth resolutions to which the colorBufferDepth

property can be set.

### Parameters
None.

### Example
```lingo
This statement displays a detailed property list of information about the user’s hardware:
put getRendererServices().getHardwareInfo()
-- [#present: 1, #vendor: "NVIDIA Corporation", #model: \
"32MB DDR NVIDIA GeForce2 GTS (Dell)", #version: "4.12.01.0532", \
#maxTextureSize: [2048, 2048], #supportedTextureRenderFormats: \
[#rgba8888, #rgba8880, #rgba5650, #rgba5551, #rgba5550, \
#rgba4444], #textureUnits: 2, #depthBufferRange: [16, 24], \
#colorBufferRange: [16, 32]]
```

### See also
getRendererServices()

### Implementation
- **File**: `apps/client/src/director/api/getHardwareInfo.js`
- **Test**: `apps/client/src/director/api/__tests__/getHardwareInfo.test.js`
- **Dependencies**: Various (depends on function)

