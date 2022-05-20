import sys
import os
import io
import time
sys.path.append('./utils')
import PIL.Image as Image
from image import *
from model import CSRNet
import torch # CARE : enabled conda

from torchvision import transforms
transform=transforms.Compose([transforms.ToTensor(),transforms.Normalize(mean=[0.485, 0.456, 0.406],          std=[0.229, 0.224, 0.225]),
                   ])
print('start')
def load_model(model_path = './utils/PartAmodel_best.pth.tar', use_gpu = False):
  model = CSRNet()
  if use_gpu:
    model = model.cuda()
  else:
    model = model.cpu()
  
  checkpoint = torch.load(model_path, map_location=torch.device('cpu'))
  model.load_state_dict(checkpoint['state_dict'])
  return model

model = load_model()


#To plot the image density map from the output, use : 
#plt.imshow(np.squeeze(output.detach().cpu().numpy(),(0,1)),cmap=CM.jet)
def prediction(model,image_path, use_gpu = False):
  print("1")
  img = transform(Image.open(image_path).convert('RGB')).cpu()
  print("2")
  output = model(img.unsqueeze(0))
  print("3")
  people_nbr = int(output.detach().cpu().sum().numpy())
  return people_nbr, output

# number, output = prediction(model, sys.argv[1], False)
# print(number)


_input = io.open(sys.stdin.fileno())
print("before while")
# while True:
x = sys.stdin.readline()
print(x)
if x is None:
  # continue
  print("none")
else:
  number, output = prediction(model, x, False)
  print(number)
    # time.sleep(120)
  # print("while")

print("end of file")