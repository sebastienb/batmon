#!/usr/bin/env python3
import smbus2
import json
import sys
import glob
import os
import time

# Cache file for storing last known I2C bus
CACHE_FILE = "/tmp/.max17048_i2c_bus_cache"
CACHE_MAX_AGE = 86400  # 24 hours

class MAX17048:
    def __init__(self, i2c_bus=None, i2c_address=0x36):
        self.address = i2c_address
        
        if i2c_bus is None:
            # Try to use cached bus first
            i2c_bus = self._get_cached_bus()
            if i2c_bus is not None:
                # Verify the cached bus still works
                if self._verify_bus(i2c_bus):
                    sys.stderr.write(f"Using cached I2C bus {i2c_bus}\n")
                else:
                    sys.stderr.write(f"Cached I2C bus {i2c_bus} no longer valid, scanning...\n")
                    i2c_bus = self._find_i2c_bus()
            else:
                i2c_bus = self._find_i2c_bus()
        
        if i2c_bus is None:
            raise Exception("MAX17048 device not found on any I2C bus")
            
        self.bus = smbus2.SMBus(i2c_bus)
        self.bus_number = i2c_bus
        
        # Update cache with current bus
        self._cache_bus(i2c_bus)

    def _get_cached_bus(self):
        """Get the last known I2C bus from cache"""
        try:
            if os.path.exists(CACHE_FILE):
                # Check if cache is recent enough
                cache_age = time.time() - os.path.getmtime(CACHE_FILE)
                if cache_age < CACHE_MAX_AGE:
                    with open(CACHE_FILE, 'r') as f:
                        return int(f.read().strip())
        except Exception:
            pass
        return None
    
    def _cache_bus(self, bus_num):
        """Cache the I2C bus number"""
        try:
            with open(CACHE_FILE, 'w') as f:
                f.write(str(bus_num))
        except Exception:
            pass
    
    def _verify_bus(self, bus_num):
        """Verify that a device exists on the given bus"""
        try:
            test_bus = smbus2.SMBus(bus_num)
            # Try to read from the device with timeout
            test_bus.read_i2c_block_data(self.address, 0x02, 2)
            test_bus.close()
            return True
        except Exception:
            try:
                test_bus.close()
            except:
                pass
            return False
    
    def _find_i2c_bus(self):
        """Scan available I2C buses to find the MAX17048 device"""
        # Find all available I2C devices
        i2c_devices = glob.glob('/dev/i2c-*')
        
        for device_path in i2c_devices:
            # Extract bus number from device path
            bus_num = int(device_path.split('-')[-1])
            
            try:
                # Try to open the bus and check for our device
                test_bus = smbus2.SMBus(bus_num)
                
                # Try to read from the device at our address
                # We'll try to read the voltage register as a test
                test_bus.read_i2c_block_data(self.address, 0x02, 2)
                
                # If we get here, the device responded
                test_bus.close()
                return bus_num
                
            except Exception:
                # Device not found on this bus, continue
                try:
                    test_bus.close()
                except:
                    pass
                continue
        
        return None

    def read_voltage(self):
        try:
            # Read voltage registers (0x02 and 0x03) with timeout
            # Note: smbus2 doesn't have built-in timeout, but Python process timeout handles this
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
            if charge_rate > 0.2:  # Charging if rate > 0.2%/hour (lowered threshold for slow charging detection)
                result["charging"] = True
                result["status"] = "charging"
            elif charge_rate < -0.2:  # Discharging if rate < -0.2%/hour
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
        
        # Add debug info about which bus was found (only visible in stderr for debugging)
        sys.stderr.write(f"Found MAX17048 on I2C bus {max17048.bus_number}\n")
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
    finally:
        max17048.close()