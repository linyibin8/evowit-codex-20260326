import UIKit
import CoreGraphics

enum ImageCropper {
    static func crop(image: UIImage, around normalizedPoint: CGPoint, sizeRatio: CGFloat = 0.35) -> UIImage {
        guard let cgImage = image.cgImage else { return image }

        let width = CGFloat(cgImage.width)
        let height = CGFloat(cgImage.height)
        let cropWidth = width * sizeRatio
        let cropHeight = height * sizeRatio

        let centerX = normalizedPoint.x * width
        let centerY = normalizedPoint.y * height

        let originX = max(0, min(width - cropWidth, centerX - cropWidth / 2))
        let originY = max(0, min(height - cropHeight, centerY - cropHeight / 2))

        let rect = CGRect(x: originX, y: originY, width: cropWidth, height: cropHeight)
        guard let cropped = cgImage.cropping(to: rect) else { return image }
        return UIImage(cgImage: cropped)
    }
}

