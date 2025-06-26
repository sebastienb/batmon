#!/usr/bin/env python3
import smbus2
import json
import sys

class MAX17048:
    def __init__(self, i2c_bus=13, i2c_address=0x36):
        self.bus = smbus2.SMBus(i2c_bus)
        self.address = i2c_address

    def read_voltage(self):
        try:
            # Read voltage registers (0x02 and 0x03)
            read = self.bus.read_i2c_block_data(self.address, 0x02, 2)
            
            # Combine the bytes and convert to voltage
            voltage_raw = (read[0] << 8) | read[1]
            voltage = voltage_raw * 0.078125  # 78.125μV per LSB
            
            return voltage / 1000  # Convert to volts
            
        except Exception as e:
            return None

    def read_percentage(self):
        try:
            # Read SOC registers (0x04 and 0x05)
            read = self.bus.read_i2c_block_data(self.address, 0x04, 2)
            
            # Combine the bytes and convert to percentage
            soc_raw = (read[0] << 8) | read[1]
            percentage = soc_raw / 256.0  # SOC is in 1/256%
            
            return min(100, max(0, percentage))
            
        except Exception:
            return None

    def read_charge_rate(self):
        try:
            # Read CRATE register (0x16)
            read = self.bus.read_i2c_block_data(self.address, 0x16, 2)
            
            # Combine bytes into 16-bit value
            crate_raw = (read[0] << 8) | read[1]
            
            # Convert to signed 16-bit
            if crate_raw > 0x7FFF:
                crate_raw -= 0x10000
            
            # Convert to %/hour (0.208%/hour per LSB)
            crate_percent_per_hour = crate_raw * 0.208
            
            return crate_percent_per_hour
            
        except Exception:
            return None

    def close(self):
        self.bus.close()

if __name__ == "__main__":
    max17048 = MAX17048()
    
    try:
        voltage = max17048.read_voltage()
        percentage = max17048.read_percentage()
        charge_rate = max17048.read_charge_rate()
        
        result = {
            "voltage": voltage,
            "percentage": percentage,
            "status": "unknown",
            "charging": False,
            "charge_rate": charge_rate
        }
        
        # Determine charging status
        if charge_rate is not None:
            if charge_rate > 1.0:  # Charging if rate > 1%/hour
                result["charging"] = True
                result["status"] = "charging"
            elif charge_rate < -1.0:  # Discharging if rate < -1%/hour
                result["charging"] = False
                result["status"] = "discharging"
            else:  # Near zero rate
                result["charging"] = False
                result["status"] = "idle"
        
        # Override with percentage-based status if not charging
        if percentage is not None and result["status"] != "charging":
            if percentage > 80:
                result["status"] = "full"
            elif percentage > 60:
                result["status"] = "good"
            elif percentage > 40:
                result["status"] = "medium"
            elif percentage > 20:
                result["status"] = "low"
            else:
                result["status"] = "critical"
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
    finally:
        max17048.close()