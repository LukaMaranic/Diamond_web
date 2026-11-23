Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$workspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$outputDirectory = (Resolve-Path (Join-Path $PSScriptRoot '..\dist\assets')).Path

$images = @(
    @{ Source = '_DSC1303.jpg'; BaseName = 'diamond-live-hero'; LargeWidth = 2400; MediumWidth = 1800; SmallWidth = 1200 },
    @{ Source = 'Messenger_creation_5DD14049-A56D-405D-801C-9087DC88D8D2.jpeg'; BaseName = 'diamond-band'; LargeWidth = 1600; SmallWidth = 900 },
    @{ Source = 'album-cover.jpg'; BaseName = 'lone-wolf-cover'; LargeWidth = 1280; SmallWidth = 800 },
    @{ Source = 'IMG-20260510-WA0032.jpg'; BaseName = 'diamond-live-mono'; LargeWidth = 1600; SmallWidth = 900 },
    @{ Source = 'IMG_20260501_011407_1.jpg'; BaseName = 'diamond-backstage'; LargeWidth = 1600; SmallWidth = 900 },
    @{ Source = 'slike za galeriju\_DSC1188.jpg'; BaseName = 'gallery-01'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\_DSC1191.jpg'; BaseName = 'gallery-02'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\_DSC1200 (1).jpg'; BaseName = 'gallery-03'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\_DSC1303.jpg'; BaseName = 'gallery-04'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\_DSC1342.jpg'; BaseName = 'gallery-05'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\_DSC1369.jpg'; BaseName = 'gallery-06'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\1782548567296.jpeg'; BaseName = 'gallery-07'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\1783796608979.jpg'; BaseName = 'gallery-08'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\IMG_20260501_011407_1.jpg'; BaseName = 'gallery-09'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\IMG-20260426-WA0128.jpg'; BaseName = 'gallery-10'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\IMG-20260426-WA0131.jpg'; BaseName = 'gallery-11'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\IMG-20260501-WA0049.jpg'; BaseName = 'gallery-12'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\IMG-20260510-WA0020.jpg'; BaseName = 'gallery-13'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\IMG-20260510-WA0032.jpg'; BaseName = 'gallery-14'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\IMG-20260710-WA0012.jpg'; BaseName = 'gallery-15'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\Messenger_creation_5DD14049-A56D-405D-801C-9087DC88D8D2.jpeg'; BaseName = 'gallery-16'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\WhatsApp Image 2026-10-22 at 17.55.16.jpeg'; BaseName = 'gallery-17'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\WhatsApp Image 2026-10-22 at 17.55.16(1).jpeg'; BaseName = 'gallery-18'; LargeWidth = 1400; SmallWidth = 720 },
    @{ Source = 'slike za galeriju\WhatsApp Image 2026-10-22 at 17.55.16(2).jpeg'; BaseName = 'gallery-19'; LargeWidth = 1400; SmallWidth = 720 }
)

$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' } |
    Select-Object -First 1

function Export-OptimizedJpeg {
    param(
        [Parameter(Mandatory)] [string] $SourcePath,
        [Parameter(Mandatory)] [string] $DestinationPath,
        [Parameter(Mandatory)] [int] $TargetWidth,
        [int] $Quality = 82
    )

    $sourceImage = [System.Drawing.Image]::FromFile($SourcePath)
    try {
        try {
            $orientation = $sourceImage.GetPropertyItem(0x0112).Value[0]
            switch ($orientation) {
                2 { $sourceImage.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX) }
                3 { $sourceImage.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
                4 { $sourceImage.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipX) }
                5 { $sourceImage.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipX) }
                6 { $sourceImage.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
                7 { $sourceImage.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipX) }
                8 { $sourceImage.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
            }
        }
        catch {
            # Files without EXIF orientation are already ready to resize.
        }

        $width = [Math]::Min($TargetWidth, $sourceImage.Width)
        $height = [int][Math]::Round($sourceImage.Height * ($width / $sourceImage.Width))
        $bitmap = New-Object System.Drawing.Bitmap($width, $height)

        try {
            $bitmap.SetResolution(72, 72)
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

            try {
                $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
                $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $graphics.DrawImage($sourceImage, 0, 0, $width, $height)
            }
            finally {
                $graphics.Dispose()
            }

            $encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
                [System.Drawing.Imaging.Encoder]::Quality,
                [long]$Quality
            )

            $temporaryPath = "$DestinationPath.$PID.tmp.jpg"
            try {
                $bitmap.Save($temporaryPath, $jpegEncoder, $encoderParameters)
                Move-Item -LiteralPath $temporaryPath -Destination $DestinationPath -Force
            }
            finally {
                if (Test-Path -LiteralPath $temporaryPath) {
                    Remove-Item -LiteralPath $temporaryPath -Force
                }
                $encoderParameters.Dispose()
            }
        }
        finally {
            $bitmap.Dispose()
        }
    }
    finally {
        $sourceImage.Dispose()
    }
}

foreach ($image in $images) {
    $sourcePath = Join-Path $workspaceRoot $image.Source
    Export-OptimizedJpeg `
        -SourcePath $sourcePath `
        -DestinationPath (Join-Path $outputDirectory "$($image.BaseName)-large.jpg") `
        -TargetWidth $image.LargeWidth

    if ($image.ContainsKey('MediumWidth')) {
        Export-OptimizedJpeg `
            -SourcePath $sourcePath `
            -DestinationPath (Join-Path $outputDirectory "$($image.BaseName)-medium.jpg") `
            -TargetWidth $image.MediumWidth
    }

    Export-OptimizedJpeg `
        -SourcePath $sourcePath `
        -DestinationPath (Join-Path $outputDirectory "$($image.BaseName)-small.jpg") `
        -TargetWidth $image.SmallWidth
}

Copy-Item `
    -LiteralPath (Join-Path $workspaceRoot 'band_logo.webp') `
    -Destination (Join-Path $outputDirectory 'band-logo.webp') `
    -Force

Get-ChildItem $outputDirectory -Filter '*.jpg' |
    Sort-Object Name |
    Select-Object Name, Length
